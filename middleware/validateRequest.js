const { createErrorResponse } = require('../utils/responseHelper');
const mongoose = require('mongoose');

/**
 * Manual validation middleware without Joi
 * @param {Array<Object>} rules - Array of validation rules
 * @returns {Function} Express middleware
 */
const validateRequest = (rules) => {
  return (req, res, next) => {
    try {
        // First verify that 'rules' is actually an array, which is the source of the error
        if (!Array.isArray(rules)) {
            console.error('[Validation Middleware Error] The "rules" argument provided is not an array. Received:', rules);
            // This is a server configuration error, so we send 500
            return res.status(500).json(
                createErrorResponse('INTERNAL_ERROR', 'Server configuration error in validation rules.')
            );
        }

        const errors = [];
        // Merge data from all possible sources (body, params, query)
        const dataToValidate = { ...req.body, ...req.params, ...req.query };

        // Go through each rule to verify it
        rules.forEach(rule => {
            const value = dataToValidate[rule.field];

            // 1. Check required fields
            if (rule.required && (value === undefined || value === null || String(value).trim() === '')) {
                errors.push(`${rule.field} is required.`);
            }
        });

        // If there are validation errors, return them
        if (errors.length > 0) {
            const errorMessage = errors.join(' ');
            return res.status(400).json(
                createErrorResponse('VALIDATION_ERROR', errorMessage)
            );
        }

        next();
    } catch (error) {
        console.error('[Validation Middleware Crash]', error);
        return res.status(500).json(
            createErrorResponse('INTERNAL_ERROR', 'An unexpected error occurred during request validation.')
        );
    }
  };
};

module.exports = validateRequest;

