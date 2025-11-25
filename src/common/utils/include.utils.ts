import { stat } from "fs";

 export const patientInclude = {
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
        id:true,
        firstName: true,
        lastName: true,
        status: true,
  }as const;
   
 
export const participantSelect = {
  id: true,
  user: { select: userInclude},
}as const;

export const chatDetailsSelect = {
  id: true,
  connection: {
    select: {
      id: true,
      doctor: { select: participantSelect },
      patient: { select: participantSelect },
    },
  },
}as const;

export const connectionSelect = {
      id: true,
      status: true,
      doctor: { select: participantSelect },
      patient: { select: participantSelect },
} as const;