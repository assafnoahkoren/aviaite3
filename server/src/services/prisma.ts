import { Prisma, PrismaClient } from '../../generated/prisma';

const prismaClient = new PrismaClient();

const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  query: {
    $allModels: {
      async delete({ model, args }) {
        // @ts-expect-error, this is a dynamic check
        return prismaClient[model].update({
          ...args,
          data: {
            deletedAt: new Date(),
          },
        });
      },
      async deleteMany({ model, args }) {
        // @ts-expect-error, this is a dynamic check
        return prismaClient[model].updateMany({
          ...args,
          data: {
            deletedAt: new Date(),
          },
        });
      },
    },
  },
  model: {
    $allModels: {
      async findDeleted<T, A>(this: T, args: Prisma.Args<T, 'findFirst'>): Promise<Prisma.Result<T, A, 'findFirst'> | null> {
        const context = Prisma.getExtensionContext(this);
        // @ts-expect-error, this is a dynamic check
        return prismaClient[context.name].findFirst({
          ...args,
          where: {
            ...args.where,
            NOT: {
              deletedAt: null,
            },
          },
        });
      },
    },
  },
  client: {
    $allModels: (model: Prisma.ModelName) => ({
        async findFirst<T, A>(this: T, args: Prisma.Args<T, 'findFirst'>): Promise<Prisma.Result<T, A, 'findFirst'> | null> {
            // @ts-expect-error, this is a dynamic check
            return prismaClient[model].findFirst({
                ...args,
                where: {
                    ...args.where,
                    deletedAt: null,
                },
            });
        },
        async findMany<T, A>(this: T, args: Prisma.Args<T, 'findMany'>): Promise<Prisma.Result<T, A, 'findMany'>> {
            // @ts-expect-error, this is a dynamic check
            return prismaClient[model].findMany({
                ...args,
                where: {
                    ...args.where,
                    deletedAt: null,
                },
            });
        },
        async findUnique<T, A>(this: T, args: Prisma.Args<T, 'findUnique'>): Promise<Prisma.Result<T, A, 'findUnique'> | null> {
            // @ts-expect-error, this is a dynamic check
            return prismaClient[model].findUnique({
                ...args,
                where: {
                    ...args.where,
                    deletedAt: null,
                },
            });
        },
    }),
  },
});

export const prisma = prismaClient.$extends(softDeleteExtension);