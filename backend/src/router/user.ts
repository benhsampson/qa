import { z } from 'zod';

import { trpc } from '../lib/trpc';
import { unAuthedProcedure } from '../procedures/unAuthed';
import { userService } from '../services/user';

export const userRouter = trpc.router({
  signUp: unAuthedProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z
          .string()
          .min(2)
          .superRefine((password, ctx) => {
            const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
            const containsLowercase = (ch: string) => /[a-z]/.test(ch);
            // const containsSpecialChar = (ch: string) =>
            //   /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
            let countOfUpperCase = 0,
              countOfLowerCase = 0,
              countOfNumbers = 0;
            // countOfSpecialChar = 0;
            for (let i = 0; i < password.length; i++) {
              const ch = password.charAt(i);
              if (!isNaN(+ch)) countOfNumbers++;
              else if (containsUppercase(ch)) countOfUpperCase++;
              else if (containsLowercase(ch)) countOfLowerCase++;
              // else if (containsSpecialChar(ch)) countOfSpecialChar++;
            }
            if (
              countOfLowerCase < 1 ||
              countOfUpperCase < 1 ||
              // countOfSpecialChar < 1 ||
              countOfNumbers < 1
            ) {
              ctx.addIssue({
                code: 'custom',
                message:
                  // 'Password must have at least 1 lowercase, 1 uppercase, 1 number, and 1 special character.',
                  'Password must have at least 1 lowercase, 1 uppercase and 1 number.',
              });
            }
          }),
      })
    )
    .mutation(({ input }) => {
      return userService.signUp(input.email, input.password);
    }),
});
