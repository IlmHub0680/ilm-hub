import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Shared grading/finalization logic used by every student- and
// instructor-facing quiz route, so "what counts as a correct answer"
// and "what happens when time runs out" are each defined exactly
// once.

export function newActiveToken() {
  return crypto.randomBytes(16).toString('hex');
}

// A SINGLE_CHOICE/MULTIPLE_CHOICE answer earns full marks only when
// the selected option set exactly matches the correct option set —
// no partial credit for multi-select, which keeps the scoring
// unambiguous and easy for students to understand.
export function scoreChoiceAnswer(question, selectedOptionIds) {
  const correctIds = question.options.filter((o) => o.isCorrect).map((o) => o.id).sort();
  const selected = [...(selectedOptionIds || [])].sort();

  const matches =
    correctIds.length === selected.length &&
    correctIds.every((id, i) => id === selected[i]);

  return matches ? question.points : 0;
}

// Finalizes an attempt: auto-grades every SINGLE_CHOICE/MULTIPLE_CHOICE
// answer, leaves WRITTEN/VIDEO answers for instructor review, and sets
// the attempt's status/score/submittedAt accordingly. Safe to call
// more than once — grading only ever touches ungraded answers, and an
// already-finalized attempt is returned unchanged.
export async function finalizeAttempt(attemptId, { auto = false } = {}) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: true,
      quiz: { include: { questions: { include: { options: true } } } },
    },
  });

  if (!attempt) return null;
  if (attempt.status !== 'IN_PROGRESS') return attempt;

  const answerByQuestionId = new Map(attempt.answers.map((a) => [a.questionId, a]));
  let needsReview = false;
  let autoScoreTotal = 0;

  for (const question of attempt.quiz.questions) {
    const answer = answerByQuestionId.get(question.id);

    if (question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') {
      const points = answer ? scoreChoiceAnswer(question, answer.selectedOptionIds) : 0;
      autoScoreTotal += points;

      if (answer) {
        await prisma.quizAnswer.update({
          where: { id: answer.id },
          data: { score: points, gradedAt: new Date() },
        });
      }
    } else {
      // WRITTEN / VIDEO — always needs a human look, even if the
      // student left it blank, so the instructor sees it was skipped
      // rather than assuming it wasn't graded yet.
      needsReview = true;
    }
  }

  const updated = await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      status: needsReview ? 'SUBMITTED' : auto ? 'AUTO_SUBMITTED' : 'GRADED',
      submittedAt: new Date(),
      score: autoScoreTotal,
    },
  });

  return updated;
}
