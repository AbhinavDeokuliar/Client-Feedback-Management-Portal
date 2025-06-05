import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram,
    FaEnvelope, FaPhone, FaMapMarkerAlt, FaHeart
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    // Animation variants for footer links
    const linkVariants = {
        hover: { scale: 1.05, color: '#3182ce' },
        tap: { scale: 0.95 }
    };

    // Social media links with icons
    const socialLinks = [
        { icon: <FaFacebookF />, href: "https://facebook.com", label: "Facebook" },
        { icon: <FaTwitter />, href: "https://twitter.com", label: "Twitter" },
        { icon: <FaLinkedinIn />, href: "https://linkedin.com", label: "LinkedIn" },
        { icon: <FaInstagram />, href: "https://instagram.com", label: "Instagram" },
    ];

    // Footer navigation links
    const footerLinks = [
        { text: "Home", path: "/" },
        { text: "About Us", path: "/about" },
        { text: "Services", path: "/services" },
        { text: "Privacy Policy", path: "/privacy" },
        { text: "Terms of Service", path: "/terms" },
        { text: "Contact Us", path: "/contact" },
    ];

    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">


                {/* Copyright Section */}

                <p className="text-center text-gray-500 text-sm">
                    © {currentYear} Feedback Portal. All rights reserved. by DC Infotech Solutions.
                </p>

            </div>
        </footer>
    );
};

export default Footer;
