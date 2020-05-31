import * as picture from "./index";
import * as mongoose from "mongoose";
import * as discord from "discord.js";

beforeAll(async () => {
    return mongoose.connect(
        process.env.MONGO_URL ||
            `mongodb://root:example@localhost/citrouille-testing?authSource=admin`,
        {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        }
    );
});

afterAll(() => {
    return mongoose.disconnect();
});

afterEach(async () => {
    picture.db.collection.drop();
});

it("should create a picture", async () => {
    let pic = await picture.db.new("patate", "test-link", {
        id: "1234",
        tag: "toto#1234",
    });

    expect(pic.link).toEqual("test-link");
    expect(pic.validated).toEqual(false);

    let fetchedPic = await picture.db.findById(pic._id);
    expect(fetchedPic.link).toEqual("test-link");
    expect(fetchedPic.validated).toEqual(false);
});

it("should validate by link", async () => {
    let pic = await picture.db.new("patate", "test-link", {
        id: "1234",
        tag: "toto#1234",
    });

    expect(pic.link).toEqual("test-link");
    expect(pic.validated).toEqual(false);

    await picture.db.markAsValidated("test-link");

    let fetchedPic = await picture.db.findById(pic._id);
    expect(fetchedPic.link).toEqual("test-link");
    expect(fetchedPic.validated).toEqual(true);
});

it("should validate by tag", async () => {
    await picture.db.new("patate", "test-link", {
        id: "1234",
        tag: "toto#1234",
    });
    await picture.db.new("patate", "test-link2", {
        id: "1234",
        tag: "toto#1234",
    });

    await picture.db.markAsValidated("toto#1234");

    let pics = await picture.db.find({});
    expect(pics.length).toEqual(2);
    pics.forEach((pic) => {
        expect(pic.validated).toEqual(true);
    });
});

it("should validate by user id", async () => {
    await picture.db.new("patate", "test-link", {
        id: "1234",
        tag: "toto#1234",
    });
    await picture.db.new("patate", "test-link2", {
        id: "1234",
        tag: "toto#1234",
    });

    await picture.db.markAsValidated("1234");

    let pics = await picture.db.find({});
    expect(pics.length).toEqual(2);
    pics.forEach((pic) => {
        expect(pic.validated).toEqual(true);
    });
});

it("should validate by album", async () => {
    await picture.db.new("patate", "test-link", {
        id: "1234",
        tag: "toto#1234",
    });
    await picture.db.new("voiture", "test-link2", {
        id: "1234",
        tag: "toto#1234",
    });
    await picture.db.new("patate", "test-link3", {
        id: "1234",
        tag: "toto#1234",
    });

    await picture.db.markAsValidated("patate");

    let pics = await picture.db.find({});
    expect(pics.length).toEqual(3);
    pics.forEach((pic) => {
        if (pic.album != "voiture") expect(pic.validated).toEqual(true);
        else expect(pic.validated).toEqual(false);
    });
});

it("should validate by mongo id", async () => {
    let pic = await picture.db.new("patate", "test-link", {
        id: "1234",
        tag: "toto#1234",
    });

    expect(pic.link).toEqual("test-link");
    expect(pic.validated).toEqual(false);

    await picture.db.markAsValidated(pic._id);

    let fetchedPic = await picture.db.findById(pic._id);
    expect(fetchedPic.link).toEqual("test-link");
    expect(fetchedPic.validated).toEqual(true);
});
