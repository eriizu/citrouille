import * as mongoose from "mongoose";
import * as assert from "assert";

export interface IAlbum {
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAlbumDocument extends mongoose.Document, IAlbum {
    addPending: (url: string, userId: string) => Promise<any>;
    acceptPending: (url: string) => Promise<any>;
}

export function isIAlbumDocument(x: any): x is IAlbumDocument {
    return x._id != undefined && x.name !== undefined;
}

const Schema = new mongoose.Schema(
    {
        name: { type: String, required: true },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

Schema.method("addPending", async function (
    this: IAlbumDocument,
    url: string,
    submittedBy: string
) {
    let res = await this.updateOne({
        $addToSet: { "pictures.pending": { link: url, submittedBy } },
    });
    assert(res.nModified);
    return res;
});

Schema.method("acceptPending", async function (this: IAlbumDocument, url: string) {
    let res = await this.updateOne({
        $pull: { "pictures.pending": { link: url } },
        $addToSet: { validated: url },
    });
    assert(res.nModified);
    return res;
});

Schema.static("new", async function (this: mongoose.Model<IAlbumDocument>, name: string) {
    return this.create({ name });
});

// Interface for the statics
export interface IAlbumModel extends mongoose.Model<IAlbumDocument> {
    new: (name: string) => Promise<IAlbumDocument>;
}

export const db = mongoose.model<IAlbumDocument, IAlbumModel>("album", Schema);
