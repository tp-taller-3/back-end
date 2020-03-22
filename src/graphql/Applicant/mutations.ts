import { GraphQLApplicant } from "./Types/Applicant";
import { GraphQLCareerCredits } from "./Types/CareerCredits";
import { Int, List, nonNull, String } from "../fieldTypes";

import {
  IApplicant,
  IApplicantEditable,
  ApplicantRepository,
  ApplicantSerializer
} from "../../models/Applicant";

const applicantMutations = {
  saveApplicant: {
    type: GraphQLApplicant,
    args: {
      name: {
        type: nonNull(String)
      },
      surname: {
        type: nonNull(String)
      },
      padron: {
        type: nonNull(Int)
      },
      description: {
        type: String
      },
      careers: {
        type: nonNull(List(GraphQLCareerCredits))
      },
      capabilities: {
        type: List(String)
      }
    },
    resolve: async (_: undefined, props: IApplicant) => {
      const applicant = await ApplicantRepository.create(props);
      return ApplicantSerializer.serialize(applicant);
    }
  },
  updateApplicant: {
    type: GraphQLApplicant,
    args: {
      name: {
        type: String
      },
      surname: {
        type: String
      },
      padron: {
        type: nonNull(Int)
      },
      description: {
        type: String
      },
      careers: {
        type: List(GraphQLCareerCredits)
      },
      capabilities: {
        type: List(String)
      }
    },
    resolve: async (_: undefined, props: IApplicantEditable) => {
      const applicant = await ApplicantRepository.findByPadron(props.padron);
      await ApplicantRepository.update(applicant, props);
      return ApplicantSerializer.serialize(applicant);
    }
  },
  deleteApplicantCapabilities: {
    type: GraphQLApplicant,
    args: {
      padron: {
        type: nonNull(Int)
      },
      capabilities: {
        type: List(String)
      }
    },
    resolve: async (_: undefined, props: { padron: number, capabilities: string[] }) => {
      const applicant = await ApplicantRepository.findByPadron(props.padron);
      await ApplicantRepository.deleteCapabilities(applicant, props.capabilities);
      return ApplicantSerializer.serialize(applicant);
    }
  },
  deleteApplicantCareers: {
    type: GraphQLApplicant,
    args: {
      padron: {
        type: nonNull(Int)
      },
      careersCodes: {
        type: List(String)
      }
    },
    resolve: async (_: undefined, props: { padron: number, careersCodes: string[] }) => {
      const applicant = await ApplicantRepository.findByPadron(props.padron);
      await ApplicantRepository.deleteCareers(applicant, props.careersCodes);
      return ApplicantSerializer.serialize(applicant);
    }
  }
};

export default applicantMutations;