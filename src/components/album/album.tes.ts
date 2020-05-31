import * as album from "./index";
import * as mongoose from "mongoose";

// beforeAll(async () => {
//     return mongoose.connect(
//         process.env.MONGO_URL ||
//             `mongodb://root:example@localhost/citrouille-testing?authSource=admin`,
//         {
//             useNewUrlParser: true,
//             useCreateIndex: true,
//             useUnifiedTopology: true,
//             useFindAndModify: false,
//         }
//     );
// });

// afterAll(() => {
//     return mongoose.disconnect();
// });

// it("should add a link to the album", async () => {
//     let alb = await album.db.new("julia");
//     console.log(await alb.addPending("toto", "1234"));

//     alb = await album.db.findById(alb._id);
//     expect(alb.name).toEqual("julia");
//     console.log(alb.pictures.pending);

//     expect(alb.pictures.pending.length).toEqual(1);
//     expect(alb.pictures.pending[0].link).toEqual("toto");
// });

// it("should accept a image", async () => {
//     let alb = await album.db.new("julia2");
//     console.log(await alb.addPending("toto", "1234"));

//     await alb.acceptPending("1234");

//     alb = await album.db.findById(alb._id);
//     console.log(alb);
//     console.log(alb.pictures.pending);
//     expect(alb.name).toEqual("julia2");
//     expect(alb.pictures.pending.length).toEqual(0);
//     expect(alb.pictures.validated.length).toEqual(1);
//     expect(alb.pictures.validated[0]).toEqual("toto");
// });
