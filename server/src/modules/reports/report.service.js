const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const notificationService = require('../notifications/notification.service');
const {
  REPORT_TYPES,
  REPORT_STATUSES,
  RESOLUTION_ACTIONS,
} = require('./report.constants');

const reporterSelect = { id: true, name: true, email: true, image: true };

const resourceSummarySelect = {
  select: {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    author: { select: { id: true, name: true, image: true } },
    status: true,
    visibility: true,
  },
};

const commentSummarySelect = {
  select: {
    id: true,
    content: true,
    createdAt: true,
    user: { select: { id: true, name: true, image: true } },
    postId: true,
  },
};

const userSummarySelect = {
  select: { id: true, name: true, email: true, image: true, role: true },
};

const reportInclude = {
  reporter: { select: reporterSelect },
  resolver: { select: { id: true, name: true, image: true } },
};

const getResourceSummary = async (reportType, referenceId) => {
  if (reportType === REPORT_TYPES.POST) {
    return prisma.post.findUnique({
      where: { id: referenceId },
      ...resourceSummarySelect,
    });
  }

  if (reportType === REPORT_TYPES.COMMENT) {
    const comment = await prisma.comment.findUnique({
      where: { id: referenceId },
      ...commentSummarySelect,
    });

    if (comment) {
      const post = await prisma.post.findUnique({
        where: { id: comment.postId },
        select: { id: true, title: true, slug: true },
      });
      return { ...comment, post };
    }

    return null;
  }

  if (reportType === REPORT_TYPES.USER) {
    return prisma.user.findUnique({
      where: { id: referenceId },
      ...userSummarySelect,
    });
  }

  return null;
};

const formatReport = (report) => ({
  id: report.id,
  reportType: report.reportType,
  reportReason: report.reportReason,
  description: report.description,
  status: report.status,
  referenceId: report.referenceId,
  reporter: report.reporter,
  resolver: report.resolver || null,
  resolutionNote: report.resolutionNote,
  createdAt: report.createdAt,
  updatedAt: report.updatedAt,
  resolvedAt: report.resolvedAt || null,
});

const formatPaginatedReport = async (report) => {
  const resource = await getResourceSummary(
    report.reportType,
    report.referenceId
  );
  return {
    ...formatReport(report),
    resource: resource || null,
  };
};

const verifyResourceExists = async (reportType, referenceId) => {
  if (reportType === REPORT_TYPES.POST) {
    const post = await prisma.post.findUnique({
      where: { id: referenceId },
      select: { id: true, authorId: true },
    });
    if (!post) throw new ApiError(404, 'Post not found.');
    return post;
  }

  if (reportType === REPORT_TYPES.COMMENT) {
    const comment = await prisma.comment.findUnique({
      where: { id: referenceId },
      select: { id: true, userId: true },
    });
    if (!comment) throw new ApiError(404, 'Comment not found.');
    return comment;
  }

  if (reportType === REPORT_TYPES.USER) {
    const user = await prisma.user.findUnique({
      where: { id: referenceId },
      select: { id: true },
    });
    if (!user) throw new ApiError(404, 'User not found.');
    return user;
  }

  throw new ApiError(400, 'Invalid report type.');
};

const handleReportCreation = async (
  reporterId,
  reportType,
  referenceId,
  { reason, description }
) => {
  const existing = await prisma.report.findUnique({
    where: {
      reporterId_referenceId_reportType: {
        reporterId,
        referenceId,
        reportType,
      },
    },
  });

  if (existing) {
    if (
      existing.status === REPORT_STATUSES.PENDING ||
      existing.status === REPORT_STATUSES.UNDER_REVIEW
    ) {
      throw new ApiError(
        409,
        'You have already submitted a report for this content. It is still under review.'
      );
    }

    await prisma.report.update({
      where: { id: existing.id },
      data: {
        reportReason: reason,
        description,
        status: REPORT_STATUSES.PENDING,
        resolvedBy: null,
        resolutionNote: null,
        resolvedAt: null,
      },
    });

    return { id: existing.id, created: false };
  }

  const report = await prisma.report.create({
    data: {
      reporterId,
      reportType,
      reportReason: reason,
      description,
      referenceId,
      status: REPORT_STATUSES.PENDING,
    },
  });

  return { id: report.id, created: true };
};

const createReport = async (
  reporterId,
  reportType,
  referenceId,
  { reason, description }
) => {
  const resource = await verifyResourceExists(reportType, referenceId);

  if (reportType === REPORT_TYPES.USER && resource.id === reporterId) {
    throw new ApiError(400, 'You cannot report yourself.');
  }

  if (reportType === REPORT_TYPES.POST && resource.authorId === reporterId) {
    throw new ApiError(400, 'You cannot report your own post.');
  }

  const { id: reportId } = await handleReportCreation(
    reporterId,
    reportType,
    referenceId,
    { reason, description }
  );

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  });

  const reporter = await prisma.user.findUnique({
    where: { id: reporterId },
    select: { name: true },
  });

  const notifyPromises = admins.map((admin) =>
    notificationService.createSystemNotification({
      recipientId: admin.id,
      title: 'New Report Submitted',
      message: `${reporter?.name || 'A user'} reported a ${reportType.toLowerCase()} for ${reason.toLowerCase().replace(/_/g, ' ')}.`,
      referenceId: reportId,
      referenceType: 'SYSTEM',
    })
  );

  await Promise.all(notifyPromises);

  return { success: true, message: 'Report submitted successfully.' };
};

const getReports = async (filters) => {
  const {
    page = 1,
    limit = 10,
    status,
    reportType,
    reportReason,
    sort = 'newest',
  } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (reportType) where.reportType = reportType;
  if (reportReason) where.reportReason = reportReason;

  const orderBy =
    sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const [reports, totalItems] = await prisma.$transaction([
    prisma.report.findMany({
      where,
      include: reportInclude,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.report.count({ where }),
  ]);

  const formattedReports = await Promise.all(
    reports.map(formatPaginatedReport)
  );

  const totalPages = Math.ceil(totalItems / limit);

  return {
    reports: formattedReports,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const getReportById = async (reportId) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      ...reportInclude,
    },
  });

  if (!report) throw new ApiError(404, 'Report not found.');

  const resource = await getResourceSummary(
    report.reportType,
    report.referenceId
  );

  return {
    ...formatReport(report),
    resource: resource || null,
  };
};

const changeReportStatus = async (reportId, adminId, { status }) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) throw new ApiError(404, 'Report not found.');

  if (
    report.status === REPORT_STATUSES.RESOLVED ||
    report.status === REPORT_STATUSES.REJECTED
  ) {
    throw new ApiError(
      400,
      'Cannot change status of a resolved or rejected report.'
    );
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: { status },
    include: reportInclude,
  });

  return formatReport(updated);
};

const resolveReport = async (reportId, adminId, { action, resolutionNote }) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) throw new ApiError(404, 'Report not found.');

  if (
    report.status === REPORT_STATUSES.RESOLVED ||
    report.status === REPORT_STATUSES.REJECTED
  ) {
    throw new ApiError(400, 'Report has already been resolved or rejected.');
  }

  if (
    action === RESOLUTION_ACTIONS.DELETE_POST &&
    report.reportType === REPORT_TYPES.POST
  ) {
    await prisma.post.delete({ where: { id: report.referenceId } });
  }

  if (
    action === RESOLUTION_ACTIONS.DELETE_COMMENT &&
    report.reportType === REPORT_TYPES.COMMENT
  ) {
    await prisma.comment.delete({ where: { id: report.referenceId } });
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: REPORT_STATUSES.RESOLVED,
      resolvedBy: adminId,
      resolutionNote,
      resolvedAt: new Date(),
    },
    include: reportInclude,
  });

  await notificationService.createSystemNotification({
    recipientId: report.reporterId,
    title: 'Report Resolved',
    message: `Your report has been resolved.${resolutionNote ? ` Note: ${resolutionNote}` : ''}`,
    referenceId: report.id,
    referenceType: REPORT_TYPES.SYSTEM,
  });

  return formatReport(updated);
};

const rejectReport = async (reportId, adminId, { reason }) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) throw new ApiError(404, 'Report not found.');

  if (
    report.status === REPORT_STATUSES.RESOLVED ||
    report.status === REPORT_STATUSES.REJECTED
  ) {
    throw new ApiError(400, 'Report has already been resolved or rejected.');
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: REPORT_STATUSES.REJECTED,
      resolvedBy: adminId,
      resolutionNote: reason,
      resolvedAt: new Date(),
    },
    include: reportInclude,
  });

  await notificationService.createSystemNotification({
    recipientId: report.reporterId,
    title: 'Report Rejected',
    message: `Your report has been reviewed and rejected. Reason: ${reason}`,
    referenceId: report.id,
    referenceType: REPORT_TYPES.SYSTEM,
  });

  return formatReport(updated);
};

const getReportAnalytics = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [pending, underReview, resolved, rejected, today, thisWeek, thisMonth] =
    await Promise.all([
      prisma.report.count({ where: { status: REPORT_STATUSES.PENDING } }),
      prisma.report.count({ where: { status: REPORT_STATUSES.UNDER_REVIEW } }),
      prisma.report.count({ where: { status: REPORT_STATUSES.RESOLVED } }),
      prisma.report.count({ where: { status: REPORT_STATUSES.REJECTED } }),
      prisma.report.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.report.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.report.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

  return {
    pending,
    underReview,
    resolved,
    rejected,
    today,
    thisWeek,
    thisMonth,
  };
};

const detectSpam = () => {
  return {
    implemented: false,
    message: 'AI spam detection not yet integrated.',
  };
};

const detectToxicity = () => {
  return {
    implemented: false,
    message: 'AI toxicity detection not yet integrated.',
  };
};

const detectDuplicateReports = async (referenceId, reportType) => {
  const count = await prisma.report.count({
    where: {
      referenceId,
      reportType,
      status: { in: [REPORT_STATUSES.PENDING, REPORT_STATUSES.UNDER_REVIEW] },
    },
  });

  return { duplicateCount: count, hasDuplicates: count > 0 };
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  changeReportStatus,
  resolveReport,
  rejectReport,
  getReportAnalytics,
  detectSpam,
  detectToxicity,
  detectDuplicateReports,
};
