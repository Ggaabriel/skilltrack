CREATE TABLE "NodeTag" (
    "nodeId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "NodeTag_pkey" PRIMARY KEY ("nodeId", "tagId")
);

CREATE TABLE "NodeSkill" (
    "nodeId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,

    CONSTRAINT "NodeSkill_pkey" PRIMARY KEY ("nodeId", "skillId")
);

INSERT INTO "NodeTag" ("nodeId", "tagId")
SELECT node."id", courseTag."tagId"
FROM "Node" AS node
JOIN "CourseTag" AS courseTag ON courseTag."courseId" = node."courseId"
ON CONFLICT DO NOTHING;

INSERT INTO "NodeSkill" ("nodeId", "skillId")
SELECT node."id", courseSkill."skillId"
FROM "Node" AS node
JOIN "CourseSkill" AS courseSkill ON courseSkill."courseId" = node."courseId"
ON CONFLICT DO NOTHING;

CREATE INDEX "NodeTag_tagId_idx" ON "NodeTag"("tagId");
CREATE INDEX "NodeSkill_skillId_idx" ON "NodeSkill"("skillId");

ALTER TABLE "NodeTag"
ADD CONSTRAINT "NodeTag_nodeId_fkey"
FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NodeTag"
ADD CONSTRAINT "NodeTag_tagId_fkey"
FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NodeSkill"
ADD CONSTRAINT "NodeSkill_nodeId_fkey"
FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NodeSkill"
ADD CONSTRAINT "NodeSkill_skillId_fkey"
FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE "CourseTag";
DROP TABLE "CourseSkill";

DELETE FROM "Tag" AS tag
WHERE NOT EXISTS (
    SELECT 1 FROM "NodeTag" AS nodeTag WHERE nodeTag."tagId" = tag."id"
);

DELETE FROM "Skill" AS skill
WHERE NOT EXISTS (
    SELECT 1 FROM "NodeSkill" AS nodeSkill WHERE nodeSkill."skillId" = skill."id"
);
