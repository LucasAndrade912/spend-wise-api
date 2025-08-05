export interface IQuerystring {
    page: string;
    limit: string;
}

export interface IQuerystringBankStatementByMonth extends IQuerystring {
    accountId: string;
    month: string;
}

export interface IQuerystringBankStatementByDateRange extends IQuerystring {
    accountId: string;
    start: string;
    end: string;
}

export interface IParams {
    id: string;
}
