import * as mongoose from "mongoose";
import * as assert from "assert";
import * as discord from "discord.js";

export interface IPicture {
    validated: boolean;
    link: string;
    author: discord.PartialUser;
    createdOn: Date;
    updatedOn: Date;
}

export interface IPictureDocument extends mongoose.Document, IPicture {}

const Schema = new mongoose.Schema(
    {
        link: { type: String, required: true },
        validated: { type: Boolean, required: true, default: false },
        author: {
            id: { type: String },
            tag: { type: String },
        },
    },
    { timestamps: { createdAt: "createdOn", updatedAt: "updatedOn" } }
);

//
// Schema static functions
//

// Adds a new image to database
Schema.static("new", function (this: IPictureModel, link: string, author: discord.PartialUser) {
    return this.create({ link, author });
});

// Generates the query condition to update or delete images from database
function generateCondition(criteria: string) {
    try {
        let objid = new mongoose.Types.ObjectId(criteria);
        return { _id: objid };
    } catch {
        return {
            $or: [{ link: criteria }, { "author.id": criteria }, { "author.tag": criteria }],
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

export interface IPictureModel extends mongoose.Model<IPictureDocument> {
    new: (
        this: IPictureModel,
        link: string,
        author: discord.PartialUser
    ) => Promise<IPictureDocument>;
    markAsValidated: (this: IPictureModel, criteria: string) => Promise<any>;
    delete: (this: IPictureModel, criteria: string) => Promise<any>;
}

export const db = mongoose.model<IPictureDocument, IPictureModel>("picture", Schema);
