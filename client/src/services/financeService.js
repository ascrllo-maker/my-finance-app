import api from './api';

export const budgetService = {
    // Get current month's budget
    getCurrent: async (month, year) => {
        const params = {};
        if (month) params.month = month;
        if (year) params.year = year;
        const response = await api.get('/budget', { params });
        return response.data;
    },

    // Create or update budget
    save: async (budgetData) => {
        const response = await api.post('/budget', budgetData);
        return response.data;
    },

    // Get budget history
    getHistory: async () => {
        const response = await api.get('/budget/history');
        return response.data;
    },

    // Update category spending
    updateSpending: async (budgetId, categoryName, amount) => {
        const response = await api.put(
            `/budget/${budgetId}/category/${encodeURIComponent(categoryName)}/spend`,
            { amount }
        );
        return response.data;
    }
};

export const expenseService = {
    // Get expenses with filters
    getAll: async (filters = {}) => {
        const response = await api.get('/expenses', { params: filters });
        return response.data;
    },

    // Add expense
    create: async (expenseData) => {
        const response = await api.post('/expenses', expenseData);
        return response.data;
    },

    // Update expense
    update: async (id, expenseData) => {
        const response = await api.put(`/expenses/${id}`, expenseData);
        return response.data;
    },

    // Delete expense
    delete: async (id) => {
        const response = await api.delete(`/expenses/${id}`);
        return response.data;
    },

    // Get spending summary
    getSummary: async (month, year) => {
        const params = {};
        if (month) params.month = month;
        if (year) params.year = year;
        const response = await api.get('/expenses/summary', { params });
        return response.data;
    }
};

export const goalService = {
    // Get all goals
    getAll: async () => {
        const response = await api.get('/goals');
        return response.data;
    },

    // Create goal
    create: async (goalData) => {
        const response = await api.post('/goals', goalData);
        return response.data;
    },

    // Update goal
    update: async (id, goalData) => {
        const response = await api.put(`/goals/${id}`, goalData);
        return response.data;
    },

    // Delete goal
    delete: async (id) => {
        const response = await api.delete(`/goals/${id}`);
        return response.data;
    },

    // Add contribution
    contribute: async (id, amount, notes) => {
        const response = await api.post(`/goals/${id}/contribute`, { amount, notes });
        return response.data;
    }
};

export const categoryService = {
    // Get all categories
    getAll: async (type) => {
        const params = type ? { type } : {};
        const response = await api.get('/categories', { params });
        return response.data;
    },

    // Create category
    create: async (categoryData) => {
        const response = await api.post('/categories', categoryData);
        return response.data;
    },

    // Update category
    update: async (id, categoryData) => {
        const response = await api.put(`/categories/${id}`, categoryData);
        return response.data;
    },

    // Delete category
    delete: async (id) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    }
};

export const recurringService = {
    // Get all recurring payments
    getAll: async () => {
        const response = await api.get('/recurring');
        return response.data;
    },

    // Get upcoming payments
    getUpcoming: async (days = 7) => {
        const response = await api.get('/recurring/upcoming', { params: { days } });
        return response.data;
    },

    // Create recurring payment
    create: async (paymentData) => {
        const response = await api.post('/recurring', paymentData);
        return response.data;
    },

    // Update recurring payment
    update: async (id, paymentData) => {
        const response = await api.put(`/recurring/${id}`, paymentData);
        return response.data;
    },

    // Delete recurring payment
    delete: async (id) => {
        const response = await api.delete(`/recurring/${id}`);
        return response.data;
    },

    // Mark as processed
    process: async (id) => {
        const response = await api.post(`/recurring/${id}/process`);
        return response.data;
    }
};

export const reportService = {
    // Get monthly report
    getMonthly: async (month, year) => {
        const params = {};
        if (month) params.month = month;
        if (year) params.year = year;
        const response = await api.get('/reports/monthly', { params });
        return response.data;
    },

    // Get yearly summary
    getYearly: async (year) => {
        const params = year ? { year } : {};
        const response = await api.get('/reports/yearly', { params });
        return response.data;
    },

    // Get spending trends
    getTrends: async (months = 6) => {
        const response = await api.get('/reports/trends', { params: { months } });
        return response.data;
    },

    // Get dashboard data
    getDashboard: async () => {
        const response = await api.get('/reports/dashboard');
        return response.data;
    }
};
