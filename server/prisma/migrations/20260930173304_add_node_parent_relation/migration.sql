-- CreateIndex
CREATE INDEX "Node_courseId_parentId_idx" ON "Node"("courseId", "parentId");

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;
