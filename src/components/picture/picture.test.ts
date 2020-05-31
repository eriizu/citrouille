import * as picture from "./index";
import * as mongoose from "mongoose";
import * as discord from "discord.js";

beforeAll(async () => {
    return mongoose.connect(
        process.env.MONGO_URL ||
            `mongodb://dev-citrouille:citrouille@mongo.arthurphilippe.me:80/dev-citrouille?tls=true&authSource=admin`,
        {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        }
    );
});

afterAll(async () => {
    await picture.db.collection.drop();
    return mongoose.disconnect();
});

// afterEach(async () => {
// });

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
    let pic = await picture.db.new("potate", "test-link", {
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
    await picture.db.new("ttag-val", "test-link", {
        id: "1234",
        tag: "toto#1234",
    });
    await picture.db.new("ttag-val", "test-link2", {
        id: "1234",
        tag: "toto#1234",
    });

    await picture.db.markAsValidated("toto#1234");

    let pics = await picture.db.find({ album: "ttag-val" });
    expect(pics.length).toEqual(2);
    pics.forEach((pic) => {
        expect(pic.validated).toEqual(true);
    });
});

it("should validate by user id", async () => {
    await picture.db.new("uid", "test-link", {
        id: "7894",
        tag: "toto#7894",
    });
    await picture.db.new("uid", "test-link2", {
        id: "7894",
        tag: "toto#7894",
    });

    await picture.db.markAsValidated("7894");

    let pics = await picture.db.find({ album: "uid" });
    expect(pics.length).toEqual(2);
    pics.forEach((pic) => {
        expect(pic.validated).toEqual(true);
    });
});

it("should validate by album", async () => {
    await picture.db.new("val-by-album", "test-link", {
        id: "4586",
        tag: "toto#4586",
    });
    await picture.db.new("voiture-val-by-album", "test-link2", {
        id: "4586",
        tag: "toto#4586",
    });
    await picture.db.new("val-by-album", "test-link3", {
        id: "4586",
        tag: "toto#4586",
    });

    let res = await picture.db.markAsValidated("val-by-album");
    expect(res.nModified).toEqual(2);

    let pics = await picture.db.find({
        $or: [{ album: "val-by-album" }, { album: "voiture-val-by-album" }],
    });
    expect(pics.length).toEqual(3);
    pics.forEach((pic) => {
        if (pic.album == "voiture-val-by-album") expect(pic.validated).toEqual(false);
        else if (pic.album == "val-by-album") expect(pic.validated).toEqual(true);
    });
});

it("should validate by mongo id", async () => {
    let pic = await picture.db.new("val-by-mongo-id", "test-link", {
        id: "78104",
        tag: "toto#78104",
    });

    expect(pic.link).toEqual("test-link");
    expect(pic.validated).toEqual(false);

    await picture.db.markAsValidated(pic._id);

    let fetchedPic = await picture.db.findById(pic._id);
    expect(fetchedPic.link).toEqual("test-link");
    expect(fetchedPic.validated).toEqual(true);
});

it("should delete by id", async () => {
    await picture.db.new("patate-douce", "test-link", {
        id: "1234",
        tag: "toto#1234",
    });
    await picture.db.new("voiture-douce", "test-link2", {
        id: "1234",
        tag: "toto#1234",
    });
    await picture.db.new("patate-douce", "test-link3", {
        id: "1234",
        tag: "toto#1234",
    });

    let res = await picture.db.markAsValidated("patate-douce");
    expect(res.nModified).toEqual(2);

    let pics = await picture.db.find({
        $or: [{ album: "patate-douce" }, { album: "voiture-douce" }],
    });
    expect(pics.length).toEqual(3);
    pics.forEach((pic) => {
        if (pic.album != "voiture-douce") expect(pic.validated).toEqual(true);
        else expect(pic.validated).toEqual(false);
    });

    res = await picture.db.delete([pics[0]._id, pics[1]._id]);
    expect(res.deletedCount).toEqual(2);
});
