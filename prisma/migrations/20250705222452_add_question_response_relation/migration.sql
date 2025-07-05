-- AddForeignKey
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "roast_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
