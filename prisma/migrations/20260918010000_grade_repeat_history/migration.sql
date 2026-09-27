-- Grade used to be unique on (studentId, courseId) alone, so a
-- repeated course's new grade silently overwrote the original
-- attempt (term included) instead of being recorded alongside it.
-- Widening the key to (studentId, courseId, termId) lets each
-- attempt keep its own row; existing rows (termId already set or
-- null) are untouched by this migration -- no data is rewritten.
DROP INDEX "Grade_studentId_courseId_key";

CREATE UNIQUE INDEX "Grade_studentId_courseId_termId_key" ON "Grade"("studentId", "courseId", "termId");
