-- pgvector (the database user needs permission to create extensions)
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "knowledge_base" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" INTEGER,
    "project_id" INTEGER,
    "chunk_index" INTEGER,
    "chunk_text" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "embedding" vector(1536),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_base_pkey" PRIMARY KEY ("id")
);

-- Seed reference data the app expects to exist
INSERT INTO "Role" ("role_name", "updated_at") VALUES
    ('admin', CURRENT_TIMESTAMP),
    ('default', CURRENT_TIMESTAMP)
ON CONFLICT ("role_name") DO NOTHING;

INSERT INTO "Status" ("name", "updated_at") VALUES
    ('To Do', CURRENT_TIMESTAMP),
    ('In Progress', CURRENT_TIMESTAMP),
    ('Done', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;
