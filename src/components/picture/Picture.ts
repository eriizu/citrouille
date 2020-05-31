import * as mongoose from "mongoose";
import * as assert from "assert";
import * as discord from "discord.js";
import * as album from "../album";

export interface IPicture {
    validated: boolean;
    link: string;
    author: discord.PartialUser;
    album: string;
    createdOn: Date;
    updatedOn: Date;
}

export interface IPictureDocument extends mongoose.Document, IPicture {}

const Schema = new mongoose.Schema(
    {
        link: { type: String, required: true },
        validated: { type: Boolean, default: false },
        author: {
            id: { type: String },
            tag: { type: String },
        },
        album: { type: String, required: true },
    },
    { timestamps: { createdAt: "createdOn", updatedAt: "updatedOn" } }
);

//
// Schema static functions
//

// Adds a new image to database
Schema.static("new", function (
    this: IPictureModel,
    album: string,
    link: string,
    author: { id: string; tag: string },
    validated?: boolean
) {
    return this.create({ album, link, author: { id: author.id, tag: author.tag }, validated });
});

// Generates the query condition to update or delete images from database
function generateCondition(criteria: string) {
    try {
        let objid = new mongoose.Types.ObjectId(criteria);
        return { _id: objid };
    } catch {
        return {
            $or: [
                { link: criteria },
                { album: criteria },
                { "author.id": criteria },
                { "author.tag": criteria },
            ],
        };
    }
}

// Validates one or more images
Schema.static("markAsValidated", async function (this: IPictureModel, criteria: string) {
    let res = await this.updateMany(
        generateCondition(criteria),
        { validated: true },
        { upsert: false, multi: true, timestamps: true }
    );
    assert(res.ok);
    return res;
});

// Deletes one or more images.
Schema.static("delete", async function (this: IPictureModel, criteria: string) {
    let res = await this.deleteMany(generateCondition(criteria));
    assert(res.ok);
    return res;
});

Schema.static("getNotValidated", async function (
    this: IPictureModel
): Promise<Array<IPictureDocument>> {
    return this.find({ validated: false });
});

export interface IPictureModel extends mongoose.Model<IPictureDocument> {
    new: (
        this: IPictureModel,
        album: string,
        link: string,
        author: { id: string; tag: string },
        validated?: boolean
    ) => Promise<IPictureDocument>;
    markAsValidated: (this: IPictureModel, criteria: string) => Promise<any>;
    delete: (this: IPictureModel, criteria: string) => Promise<any>;
    getNotValidated: (this: IPictureModel) => Promise<Array<IPictureDocument>>;
}

export const db = mongoose.model<IPictureDocument, IPictureModel>("picture", Schema);
