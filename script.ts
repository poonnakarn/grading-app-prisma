/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client'
import { add } from 'date-fns'

const prisma = new PrismaClient()

// A `main` function so that you can use async/await
async function main() {
  await prisma.courseEnrollment.deleteMany({})
  await prisma.testResult.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.test.deleteMany({})
  await prisma.course.deleteMany({})

  const poon = await prisma.user.create({
    data: {
      email: 'poonnakarn@gmail.com',
      firstName: 'Poonnakarn',
      lastName: 'Panjasriprakarn',
      social: {
        facebook: 'Poon Panjasriprakarn',
        twitter: 'poonnakarn',
      },
    },
  })

  const weekFromNow = add(new Date(), { days: 7 })
  const twoWeekFromNow = add(new Date(), { days: 14 })
  const monthFromNow = add(new Date(), { days: 28 })

  const course = await prisma.course.create({
    data: {
      name: 'CRUD with Prisma in the real world',
      courseDetails: 'A soft introduction to CRUD with Prisma',
      tests: {
        create: [
          {
            date: weekFromNow,
            name: 'First test',
          },
          {
            date: twoWeekFromNow,
            name: 'Second test',
          },
          {
            date: monthFromNow,
            name: 'Final exam',
          },
        ],
      },
      members: {
        create: {
          role: 'TEACHER',
          user: {
            connect: {
              email: poon.email,
            },
          },
        },
      },
    },
    include: {
      tests: true,
      members: { include: { user: true } },
    },
  })

  console.log(course)

  const shakuntala = await prisma.user.create({
    data: {
      email: 'devi@prisma.io',
      firstName: 'Shakuntala',
      lastName: 'Devi',
      courses: {
        create: {
          role: 'STUDENT',
          course: {
            connect: { id: course.id },
          },
        },
      },
      social: {
        twitter: 'devi',
      },
    },
  })

  const david = await prisma.user.create({
    data: {
      email: 'david@prisma.io',
      firstName: 'David',
      lastName: 'Deutsch',
      courses: {
        create: {
          role: 'STUDENT',
          course: {
            connect: { id: course.id },
          },
        },
      },
      social: {
        twitter: 'david',
      },
    },
  })

  const testResults = [800, 950, 700]

  let counter = 0
  for (const test of course.tests) {
    const shakuntalaTestResult = await prisma.testResult.create({
      data: {
        gradedBy: {
          connect: { email: poon.email },
        },
        student: {
          connect: { email: shakuntala.email },
        },
        test: { connect: { id: test.id } },
        result: testResults[counter],
      },
    })

    counter++
  }

  const results = await prisma.testResult.aggregate({
    where: { studentId: shakuntala.id },
    _avg: { result: true },
    _max: { result: true },
    _min: { result: true },
    _count: true,
  })

  console.log(results)
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
