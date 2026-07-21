const prisma = require('../../config/db');

const createAuditLog = async ({
  adminId,
  action,
  targetType,
  targetId,
  metadata,
}) => {
  return prisma.adminAuditLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      metadata: metadata || {},
    },
  });
};

const formatPaginatedResponse = (items, totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    items,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

module.exports = {
  createAuditLog,
  formatPaginatedResponse,
};
