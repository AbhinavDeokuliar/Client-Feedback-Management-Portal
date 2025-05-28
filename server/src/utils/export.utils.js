const ExportLog = require('../models/export-log.model');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');
const { ApiError } = require('../middleware/error.middleware');
const XLSX = require('xlsx');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const statAsync = promisify(fs.stat);

/**
 * Base export utility class with improved streaming support
 */
class ExportUtility {
  constructor(user, filters = {}) {
    this.user = user;
    this.filters = filters;
    this.exportLog = null;
    this.outputDir = path.join(__dirname, '../../uploads/exports');

    // Create exports directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Initialize the export log entry
   */
  async initExportLog(fileName, exportType) {
    try {
      this.fileName = fileName;
      const filePath = path.join(this.outputDir, fileName);

      // Create export log entry
      this.exportLog = await ExportLog.create({
        exportType,
        generatedBy: this.user._id,
        fileName,
        filePath,
        status: 'processing',
        filters: this.filters
      });

      return this.exportLog;
    } catch (error) {
      logger.error('Error initializing export log:', error);
      throw error;
    }
  }

  /**
   * Update export log on completion
   */
  async completeExport(fileSize, recordCount) {
    try {
      if (!this.exportLog) {
        throw new ApiError(500, 'Export log not initialized');
      }

      this.exportLog.status = 'completed';
      this.exportLog.completedAt = Date.now();
      this.exportLog.fileSize = fileSize;
      this.exportLog.recordCount = recordCount;

      await this.exportLog.save();

      return this.exportLog;
    } catch (error) {
      logger.error('Error updating export log on completion:', error);
      throw error;
    }
  }

  /**
   * Update export log on failure
   */
  async failExport(errorMessage) {
    try {
      if (!this.exportLog) {
        logger.error('Export failed before initialization:', errorMessage);
        return;
      }

      this.exportLog.status = 'failed';
      this.exportLog.error = errorMessage;

      await this.exportLog.save();

      return this.exportLog;
    } catch (error) {
      logger.error('Error updating export log on failure:', error);
      throw error;
    }
  }

  /**
   * Generate a unique file name
   */
  generateFileName(prefix, extension) {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const userId = this.user._id.toString().slice(-6);
    return `${prefix}_${timestamp}_${userId}.${extension}`;
  }

  /**
   * Get file stats
   */
  async getFileStats(filePath) {
    try {
      const stats = await statAsync(filePath);
      return stats.size; // Return file size in bytes
    } catch (error) {
      logger.error(`Error getting file stats for ${filePath}:`, error);
      return 0;
    }
  }

  /**
   * Process data for export - formatting common fields
   */
  processData(data) {
    return data.map(item => ({
      id: item._id?.toString() || '',
      title: item.title || '',
      description: (item.description || '').replace(/[\r\n]+/g, ' '),
      status: item.status || '',
      priority: item.priority || '',
      category: item.category?.name || '',
      submittedBy: item.submittedBy?.name || item.submittedBy?.email || '',
      assignedTo: item.assignedTo?.name || item.assignedTo?.email || '',
      tagsCount: Array.isArray(item.tags) ? item.tags.length : 0,
      commentsCount: Array.isArray(item.comments) ? item.comments.length : 0,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : '',
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : ''
    }));
  }

  /**
   * Generate export based on format
   */
  async generateExport(data, format = 'xlsx', type = 'feedback') {
    try {
      // Process data for export
      const processedData = this.processData(data);

      // Generate export based on format
      if (format === 'csv') {
        return await this.generateCsvExport(processedData, type);
      } else {
        return await this.generateExcelExport(processedData, type);
      }
    } catch (error) {
      logger.error(`Error generating ${format} export:`, error);
      await this.failExport(error.message);
      throw error;
    }
  }

  /**
   * Generate CSV export
   */
  async generateCsvExport(data, type) {
    try {
      const fileName = this.generateFileName(`${type}_data`, 'csv');
      const filePath = path.join(this.outputDir, fileName);

      // Initialize export log
      await this.initExportLog(fileName, 'csv');

      // Define CSV headers
      const headers = [
        { id: 'id', title: 'ID' },
        { id: 'title', title: 'Title' },
        { id: 'description', title: 'Description' },
        { id: 'status', title: 'Status' },
        { id: 'priority', title: 'Priority' },
        { id: 'category', title: 'Category' },
        { id: 'submittedBy', title: 'Submitted By' },
        { id: 'assignedTo', title: 'Assigned To' },
        { id: 'tagsCount', title: 'Tags Count' },
        { id: 'commentsCount', title: 'Comments Count' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'updatedAt', title: 'Updated At' }
      ];

      // Create CSV writer
      const csvWriter = createCsvWriter({
        path: filePath,
        header: headers
      });

      // Write data to CSV
      await csvWriter.writeRecords(data);

      // Get file size
      const fileSize = await this.getFileStats(filePath);

      // Update export log
      await this.completeExport(fileSize, data.length);

      return {
        fileName,
        filePath,
        exportLogId: this.exportLog._id
      };
    } catch (error) {
      logger.error('Error generating CSV export:', error);
      await this.failExport(error.message);
      throw error;
    }
  }

  /**
   * Generate Excel export with better memory management
   */
  async generateExcelExport(data, type) {
    try {
      const fileName = this.generateFileName(`${type}_data`, 'xlsx');
      const filePath = path.join(this.outputDir, fileName);

      // Initialize export log
      await this.initExportLog(fileName, 'excel');

      // Create worksheet with data
      const ws = XLSX.utils.json_to_sheet(data);

      // Set column widths
      const colWidths = [
        { wch: 24 }, // ID
        { wch: 30 }, // Title
        { wch: 40 }, // Description
        { wch: 15 }, // Status
        { wch: 15 }, // Priority
        { wch: 20 }, // Category
        { wch: 20 }, // Submitted By
        { wch: 20 }, // Assigned To
        { wch: 12 }, // Tags Count
        { wch: 15 }, // Comments Count
        { wch: 20 }, // Created At
        { wch: 20 }  // Updated At
      ];
      ws['!cols'] = colWidths;

      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');

      // Add metadata sheet
      const metadataWs = XLSX.utils.aoa_to_sheet([
        ['Export Date', new Date().toLocaleString()],
        ['Generated By', this.user.name || this.user.email || 'System'],
        ['Record Count', data.length],
        ['Export Type', `${type.charAt(0).toUpperCase() + type.slice(1)} Data Export`],
        ['Filters', '']
      ]);

      // Add filters to metadata
      let rowIndex = 5;
      if (this.filters && Object.keys(this.filters).length > 0) {
        Object.entries(this.filters).forEach(([key, value]) => {
          const propName = key.charAt(0).toUpperCase() + key.slice(1);
          let displayValue = value;

          if (value instanceof Date) {
            displayValue = value.toLocaleDateString();
          } else if (typeof value === 'object' && value !== null) {
            displayValue = JSON.stringify(value);
          }

          const row = [];
          row[0] = `  ${propName}`;
          row[1] = displayValue;

          const range = { s: { c: 0, r: rowIndex }, e: { c: 1, r: rowIndex } };
          if (!metadataWs['!rows']) metadataWs['!rows'] = [];
          metadataWs['!rows'][rowIndex] = { hpt: 20 };

          // Set cell value
          if (!metadataWs['!data']) metadataWs['!data'] = [];
          if (!metadataWs['!data'][rowIndex]) metadataWs['!data'][rowIndex] = [];

          metadataWs[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })] = {
            t: 's',
            v: row[0]
          };

          metadataWs[XLSX.utils.encode_cell({ r: rowIndex, c: 1 })] = {
            t: 's',
            v: row[1]
          };

          rowIndex++;
        });
      } else {
        const row = [];
        row[0] = '  Note';
        row[1] = 'No filters applied';

        metadataWs[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })] = {
          t: 's',
          v: row[0]
        };

        metadataWs[XLSX.utils.encode_cell({ r: rowIndex, c: 1 })] = {
          t: 's',
          v: row[1]
        };
      }

      // Add metadata worksheet
      XLSX.utils.book_append_sheet(wb, metadataWs, 'Metadata');

      // Write to file using buffer to avoid memory issues
      const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      await writeFileAsync(filePath, excelBuffer);

      // Get file size
      const fileSize = await this.getFileStats(filePath);

      // Update export log
      await this.completeExport(fileSize, data.length);

      return {
        fileName,
        filePath,
        exportLogId: this.exportLog._id
      };
    } catch (error) {
      logger.error('Error generating Excel export:', error);
      await this.failExport(error.message);
      throw error;
    }
  }
}

module.exports = {
  ExportUtility
};
