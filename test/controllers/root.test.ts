import request from "supertest";
import app from "../../src/app";
import {OK, CREATED} from "http-status-codes";
import Database from "../../src/config/database";
import {RootsRepository} from "../../src/roots/roots_repository";
import Roots from "../../src/roots/roots";

describe("Root path", () => {
  const dummyTest = { title: "test" } as any;

  beforeEach(async () => {
    await RootsRepository.truncate();
    const root = new Roots(dummyTest);
    const record: any = await RootsRepository.save(root);
    dummyTest.id = record.id;
  });

  afterAll(() => {
    return Database.close();
  });

  describe("GET", () => {
    test("It should give an OK status", async () => {
      const response = await request(app).get("/");
      expect(response.status).toEqual(OK);
      expect(response.body.data.length).toEqual(1);
    });

    test("It should give an OK status and return by id", async () => {
      const response = await request(app).get(`/${dummyTest.id}`);
      expect(response.status).toEqual(OK);
      expect(response.body.data.title).toEqual(dummyTest.title);
    });
  });

  describe("POST", () => {
    test("It should give an CREATED status", async () => {
      const response = await request(app).post("/").send({ title: "test" });
      expect(response.status).toEqual(CREATED);
      expect(response.body.data.title).toEqual(dummyTest.title);
    });
  });
});
