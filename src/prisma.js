const { PrismaClient } = require("@prisma/client");

// One PrismaClient for the whole app
const prisma = new PrismaClient();

module.exports = prisma;
