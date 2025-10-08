 export   const patientInclude = {
    patient: {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
        },
        },
      },
    },
  };

   export const doctorInclude = {
    doctor: {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        specialization: true,
      },
    },
  };
 export const userInclude = {
    user: {
      select: {
        id:true,
        firstName: true,
        lastName: true,
        status: true,
      },
    },
  };
   