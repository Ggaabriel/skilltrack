-- CreateTable
CREATE TABLE "NodeProgress" (
    "id" SERIAL NOT NULL,
    "percentage" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "nodeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NodeProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NodeProgress_nodeId_idx" ON "NodeProgress"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "NodeProgress_userId_nodeId_key" ON "NodeProgress"("userId", "nodeId");

-- AddForeignKey
ALTER TABLE "NodeProgress" ADD CONSTRAINT "NodeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeProgress" ADD CONSTRAINT "NodeProgress_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
