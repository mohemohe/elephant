import {action, observable} from "mobx";
import StoreBase, {Mode, State} from "./StoreBase";

export interface Welcome {
    kind:       string;
    totalItems: number;
    items:      Item[];
}

export interface Item {
    kind:       string;
    id:         string;
    etag:       string;
    selfLink:   string;
    volumeInfo: VolumeInfo;
    saleInfo:   SaleInfo;
    accessInfo: AccessInfo;
    searchInfo: SearchInfo;
}

export interface AccessInfo {
    country:                string;
    viewability:            string;
    embeddable:             boolean;
    publicDomain:           boolean;
    textToSpeechPermission: string;
    epub:                   Epub;
    pdf:                    Epub;
    webReaderLink:          string;
    accessViewStatus:       string;
    quoteSharingAllowed:    boolean;
}

export interface Epub {
    isAvailable:  boolean;
    acsTokenLink: string;
}

export interface SaleInfo {
    country:     string;
    saleability: string;
    isEbook:     boolean;
    listPrice:   SaleInfoListPrice;
    retailPrice: SaleInfoListPrice;
    buyLink:     string;
    offers:      Offer[];
}

export interface SaleInfoListPrice {
    amount:       number;
    currencyCode: string;
}

export interface Offer {
    finskyOfferType: number;
    listPrice:       OfferListPrice;
    retailPrice:     OfferListPrice;
}

export interface OfferListPrice {
    amountInMicros: number;
    currencyCode:   string;
}

export interface SearchInfo {
    textSnippet: string;
}

export interface VolumeInfo {
    title:               string;
    authors:             string[];
    publisher:           string;
    publishedDate:       Date;
    description:         string;
    industryIdentifiers: IndustryIdentifier[];
    readingModes:        ReadingModes;
    printType:           string;
    categories:          string[];
    maturityRating:      string;
    allowAnonLogging:    boolean;
    contentVersion:      string;
    panelizationSummary: PanelizationSummary;
    imageLinks:          ImageLinks;
    language:            string;
    previewLink:         string;
    infoLink:            string;
    canonicalVolumeLink: string;
}

export interface ImageLinks {
    smallThumbnail: string;
    thumbnail:      string;
}

export interface IndustryIdentifier {
    type:       string;
    identifier: string;
}

export interface PanelizationSummary {
    containsEpubBubbles:  boolean;
    containsImageBubbles: boolean;
}

export interface ReadingModes {
    text:  boolean;
    image: boolean;
}

export class GoogleStore extends StoreBase {
    @observable
    public items: Item[];

    constructor() {
        super();

        this.items = [];
    }

    @action
    public async fetch(q: string) {
        this.setMode(Mode.GET);
        this.setState(State.RUNNING);

        try {
            const url = `https://www.googleapis.com/books/v1/volumes?q=${q}`;
            const response = await fetch(url, {
                method: "GET",
            });

            if (response.status === 400) {
                this.items = [];
                this.setState(State.DONE);
                return;
            }
            if (response.status !== 200) {
                throw new Error();
            }
            const result = await response.json();
            this.items = result.items;

            this.setState(State.DONE);
        } catch (e) {
            this.tryShowToast("Google Books APIの取得に失敗しました");
            console.error(e);
            this.setState(State.ERROR);
        }
    }
}