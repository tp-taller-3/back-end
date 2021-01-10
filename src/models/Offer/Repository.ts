import { Database } from "$config";
import { Op, Transaction } from "sequelize";

import { IFindAll, IOfferAssociations } from "./Interface";

import { OfferSectionRepository } from "./OfferSection";
import { OfferCareerRepository } from "./OfferCareer";

import { ICreateOffer } from "$models/Offer/Interface";
import { PaginationQuery } from "$models/PaginationQuery";
import { Offer } from "$models";
import {
  OfferCareersIncludeClauseBuilder,
  OfferTitleWhereClauseBuilder,
  CompanyIncludeClauseBuilder,
  ApprovedOfferTargetWhereClause
} from "$models/QueryBuilder";
import { OfferNotFoundError } from "./Errors";
import { Includeable, WhereOptions } from "sequelize/types/lib/model";

export const OfferRepository = {
  save: (offer: Offer, transaction?: Transaction) => offer.save({ transaction }),
  create: ({ careers, sections, ...attributes }: ICreateOffer) =>
    Database.transaction(async transaction => {
      const offer = new Offer(attributes);
      await offer.save({ transaction });
      await OfferCareerRepository.bulkCreate({ careers, offer, transaction });
      await new OfferSectionRepository().update({ sections, offer, transaction });
      return offer;
    }),
  update: ({ careers, sections, offer }: IOfferAssociations & { offer: Offer }) =>
    Database.transaction(async transaction => {
      await new OfferSectionRepository().update({ offer, sections, transaction });
      await OfferCareerRepository.update({ careers, offer, transaction });
      return offer.save({ transaction });
    }),
  findByUuid: async (uuid: string) => {
    const offer = await Offer.findByPk(uuid);
    if (!offer) throw new OfferNotFoundError(uuid);

    return offer;
  },
  findAll: ({
    updatedBeforeThan,
    companyUuid,
    applicantType,
    careerCodes,
    title,
    approvalStatus,
    companyName,
    businessSector
  }: IFindAll) => {
    const include: Includeable[] = [];
    const careersClause = OfferCareersIncludeClauseBuilder.build({ careerCodes });
    const companyClause = CompanyIncludeClauseBuilder.build({ companyName, businessSector });
    if (careersClause) include.push(careersClause);
    if (companyClause) include.push(companyClause);

    const where: { [Op.and]: WhereOptions[] } = { [Op.and]: [] };
    const whereClause = OfferTitleWhereClauseBuilder.build({ approvalStatus, title });
    const targetClause = ApprovedOfferTargetWhereClause.build({ applicantType });
    if (whereClause) where[Op.and].push(whereClause);
    if (companyUuid) where[Op.and].push({ companyUuid });
    if (targetClause) where[Op.and].push(targetClause);

    return PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => Offer.findAll(options),
      where,
      include
    });
  },
  truncate: () => Offer.truncate({ cascade: true })
};
