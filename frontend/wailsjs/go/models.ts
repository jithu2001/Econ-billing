export namespace bindings {
	
	export class BillLineItemInput {
	    description: string;
	    amount: number;
	
	    static createFrom(source: any = {}) {
	        return new BillLineItemInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.description = source["description"];
	        this.amount = source["amount"];
	    }
	}
	export class BillInput {
	    customer_id: string;
	    reservation_id?: string;
	    bill_type: string;
	    bill_date: string;
	    is_gst_bill: boolean;
	    subtotal: number;
	    tax_amount: number;
	    discount_amount: number;
	    total_amount: number;
	    status: string;
	    line_items: BillLineItemInput[];
	
	    static createFrom(source: any = {}) {
	        return new BillInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.customer_id = source["customer_id"];
	        this.reservation_id = source["reservation_id"];
	        this.bill_type = source["bill_type"];
	        this.bill_date = source["bill_date"];
	        this.is_gst_bill = source["is_gst_bill"];
	        this.subtotal = source["subtotal"];
	        this.tax_amount = source["tax_amount"];
	        this.discount_amount = source["discount_amount"];
	        this.total_amount = source["total_amount"];
	        this.status = source["status"];
	        this.line_items = this.convertValues(source["line_items"], BillLineItemInput);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class CustomerInput {
	    full_name: string;
	    phone: string;
	    address: string;
	    id_proof_type: string;
	    id_proof_number: string;
	
	    static createFrom(source: any = {}) {
	        return new CustomerInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.full_name = source["full_name"];
	        this.phone = source["phone"];
	        this.address = source["address"];
	        this.id_proof_type = source["id_proof_type"];
	        this.id_proof_number = source["id_proof_number"];
	    }
	}
	export class LoginResult {
	    user: models.User;
	
	    static createFrom(source: any = {}) {
	        return new LoginResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.user = this.convertValues(source["user"], models.User);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PaymentInput {
	    amount: number;
	    payment_method: string;
	    payment_date: string;
	
	    static createFrom(source: any = {}) {
	        return new PaymentInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.amount = source["amount"];
	        this.payment_method = source["payment_method"];
	        this.payment_date = source["payment_date"];
	    }
	}
	export class ReservationInput {
	    customer_id: string;
	    room_id: string;
	    check_in_date: string;
	    expected_check_out_date: string;
	
	    static createFrom(source: any = {}) {
	        return new ReservationInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.customer_id = source["customer_id"];
	        this.room_id = source["room_id"];
	        this.check_in_date = source["check_in_date"];
	        this.expected_check_out_date = source["expected_check_out_date"];
	    }
	}
	export class RoomInput {
	    room_number: string;
	    type_id: string;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new RoomInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.room_number = source["room_number"];
	        this.type_id = source["type_id"];
	        this.status = source["status"];
	    }
	}
	export class RoomTypeInput {
	    name: string;
	    default_rate: number;
	
	    static createFrom(source: any = {}) {
	        return new RoomTypeInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.default_rate = source["default_rate"];
	    }
	}
	export class SettingsInput {
	    lodge_name: string;
	    address: string;
	    phone: string;
	    gst_number: string;
	    state_name: string;
	    state_code: string;
	    gst_invoice_prefix: string;
	    gst_invoice_next_number: number;
	    non_gst_invoice_prefix: string;
	    non_gst_invoice_next_number: number;
	
	    static createFrom(source: any = {}) {
	        return new SettingsInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.lodge_name = source["lodge_name"];
	        this.address = source["address"];
	        this.phone = source["phone"];
	        this.gst_number = source["gst_number"];
	        this.state_name = source["state_name"];
	        this.state_code = source["state_code"];
	        this.gst_invoice_prefix = source["gst_invoice_prefix"];
	        this.gst_invoice_next_number = source["gst_invoice_next_number"];
	        this.non_gst_invoice_prefix = source["non_gst_invoice_prefix"];
	        this.non_gst_invoice_next_number = source["non_gst_invoice_next_number"];
	    }
	}

}

export namespace clause {
	
	export class Clause {
	    Name: string;
	    BeforeExpression: any;
	    AfterNameExpression: any;
	    AfterExpression: any;
	    Expression: any;
	
	    static createFrom(source: any = {}) {
	        return new Clause(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.BeforeExpression = source["BeforeExpression"];
	        this.AfterNameExpression = source["AfterNameExpression"];
	        this.AfterExpression = source["AfterExpression"];
	        this.Expression = source["Expression"];
	    }
	}
	export class Expr {
	    SQL: string;
	    Vars: any[];
	    WithoutParentheses: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Expr(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.SQL = source["SQL"];
	        this.Vars = source["Vars"];
	        this.WithoutParentheses = source["WithoutParentheses"];
	    }
	}
	export class Where {
	    Exprs: any[];
	
	    static createFrom(source: any = {}) {
	        return new Where(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Exprs = source["Exprs"];
	    }
	}

}

export namespace gorm {
	
	export class result {
	    Result: any;
	    RowsAffected: number;
	
	    static createFrom(source: any = {}) {
	        return new result(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Result = source["Result"];
	        this.RowsAffected = source["RowsAffected"];
	    }
	}
	export class join {
	    Name: string;
	    Alias: string;
	    Conds: any[];
	    On?: clause.Where;
	    Selects: string[];
	    Omits: string[];
	    Expression: any;
	    JoinType: string;
	
	    static createFrom(source: any = {}) {
	        return new join(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Alias = source["Alias"];
	        this.Conds = source["Conds"];
	        this.On = this.convertValues(source["On"], clause.Where);
	        this.Selects = source["Selects"];
	        this.Omits = source["Omits"];
	        this.Expression = source["Expression"];
	        this.JoinType = source["JoinType"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Statement {
	    SkipDefaultTransaction: boolean;
	    DefaultTransactionTimeout: number;
	    DefaultContextTimeout: number;
	    NamingStrategy: any;
	    FullSaveAssociations: boolean;
	    Logger: any;
	    DryRun: boolean;
	    PrepareStmt: boolean;
	    PrepareStmtMaxSize: number;
	    PrepareStmtTTL: number;
	    DisableAutomaticPing: boolean;
	    DisableForeignKeyConstraintWhenMigrating: boolean;
	    IgnoreRelationshipsWhenMigrating: boolean;
	    DisableNestedTransaction: boolean;
	    AllowGlobalUpdate: boolean;
	    QueryFields: boolean;
	    CreateBatchSize: number;
	    TranslateError: boolean;
	    PropagateUnscoped: boolean;
	    ClauseBuilders: Record<string, ClauseBuilder>;
	    ConnPool: any;
	    Dialector: any;
	    Plugins: Record<string, any>;
	    Error: any;
	    RowsAffected: number;
	    Statement?: Statement;
	    TableExpr?: clause.Expr;
	    Table: string;
	    Model: any;
	    Unscoped: boolean;
	    Dest: any;
	    // Go type: reflect
	    ReflectValue: any;
	    Clauses: Record<string, clause.Clause>;
	    BuildClauses: string[];
	    Distinct: boolean;
	    Selects: string[];
	    Omits: string[];
	    ColumnMapping: Record<string, string>;
	    Joins: join[];
	    Preloads: Record<string, Array<any>>;
	    // Go type: sync
	    Settings: any;
	    ConnPool: any;
	    Schema?: schema.Schema;
	    Context: any;
	    RaiseErrorOnNotFound: boolean;
	    SkipHooks: boolean;
	    // Go type: strings
	    SQL: any;
	    Vars: any[];
	    CurDestIndex: number;
	    Result?: result;
	
	    static createFrom(source: any = {}) {
	        return new Statement(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.SkipDefaultTransaction = source["SkipDefaultTransaction"];
	        this.DefaultTransactionTimeout = source["DefaultTransactionTimeout"];
	        this.DefaultContextTimeout = source["DefaultContextTimeout"];
	        this.NamingStrategy = source["NamingStrategy"];
	        this.FullSaveAssociations = source["FullSaveAssociations"];
	        this.Logger = source["Logger"];
	        this.DryRun = source["DryRun"];
	        this.PrepareStmt = source["PrepareStmt"];
	        this.PrepareStmtMaxSize = source["PrepareStmtMaxSize"];
	        this.PrepareStmtTTL = source["PrepareStmtTTL"];
	        this.DisableAutomaticPing = source["DisableAutomaticPing"];
	        this.DisableForeignKeyConstraintWhenMigrating = source["DisableForeignKeyConstraintWhenMigrating"];
	        this.IgnoreRelationshipsWhenMigrating = source["IgnoreRelationshipsWhenMigrating"];
	        this.DisableNestedTransaction = source["DisableNestedTransaction"];
	        this.AllowGlobalUpdate = source["AllowGlobalUpdate"];
	        this.QueryFields = source["QueryFields"];
	        this.CreateBatchSize = source["CreateBatchSize"];
	        this.TranslateError = source["TranslateError"];
	        this.PropagateUnscoped = source["PropagateUnscoped"];
	        this.ClauseBuilders = source["ClauseBuilders"];
	        this.ConnPool = source["ConnPool"];
	        this.Dialector = source["Dialector"];
	        this.Plugins = source["Plugins"];
	        this.Error = source["Error"];
	        this.RowsAffected = source["RowsAffected"];
	        this.Statement = this.convertValues(source["Statement"], Statement);
	        this.TableExpr = this.convertValues(source["TableExpr"], clause.Expr);
	        this.Table = source["Table"];
	        this.Model = source["Model"];
	        this.Unscoped = source["Unscoped"];
	        this.Dest = source["Dest"];
	        this.ReflectValue = this.convertValues(source["ReflectValue"], null);
	        this.Clauses = this.convertValues(source["Clauses"], clause.Clause, true);
	        this.BuildClauses = source["BuildClauses"];
	        this.Distinct = source["Distinct"];
	        this.Selects = source["Selects"];
	        this.Omits = source["Omits"];
	        this.ColumnMapping = source["ColumnMapping"];
	        this.Joins = this.convertValues(source["Joins"], join);
	        this.Preloads = source["Preloads"];
	        this.Settings = this.convertValues(source["Settings"], null);
	        this.ConnPool = source["ConnPool"];
	        this.Schema = this.convertValues(source["Schema"], schema.Schema);
	        this.Context = source["Context"];
	        this.RaiseErrorOnNotFound = source["RaiseErrorOnNotFound"];
	        this.SkipHooks = source["SkipHooks"];
	        this.SQL = this.convertValues(source["SQL"], null);
	        this.Vars = source["Vars"];
	        this.CurDestIndex = source["CurDestIndex"];
	        this.Result = this.convertValues(source["Result"], result);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DB {
	    SkipDefaultTransaction: boolean;
	    DefaultTransactionTimeout: number;
	    DefaultContextTimeout: number;
	    NamingStrategy: any;
	    FullSaveAssociations: boolean;
	    Logger: any;
	    DryRun: boolean;
	    PrepareStmt: boolean;
	    PrepareStmtMaxSize: number;
	    PrepareStmtTTL: number;
	    DisableAutomaticPing: boolean;
	    DisableForeignKeyConstraintWhenMigrating: boolean;
	    IgnoreRelationshipsWhenMigrating: boolean;
	    DisableNestedTransaction: boolean;
	    AllowGlobalUpdate: boolean;
	    QueryFields: boolean;
	    CreateBatchSize: number;
	    TranslateError: boolean;
	    PropagateUnscoped: boolean;
	    ClauseBuilders: Record<string, ClauseBuilder>;
	    ConnPool: any;
	    Dialector: any;
	    Plugins: Record<string, any>;
	    Error: any;
	    RowsAffected: number;
	    Statement?: Statement;
	
	    static createFrom(source: any = {}) {
	        return new DB(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.SkipDefaultTransaction = source["SkipDefaultTransaction"];
	        this.DefaultTransactionTimeout = source["DefaultTransactionTimeout"];
	        this.DefaultContextTimeout = source["DefaultContextTimeout"];
	        this.NamingStrategy = source["NamingStrategy"];
	        this.FullSaveAssociations = source["FullSaveAssociations"];
	        this.Logger = source["Logger"];
	        this.DryRun = source["DryRun"];
	        this.PrepareStmt = source["PrepareStmt"];
	        this.PrepareStmtMaxSize = source["PrepareStmtMaxSize"];
	        this.PrepareStmtTTL = source["PrepareStmtTTL"];
	        this.DisableAutomaticPing = source["DisableAutomaticPing"];
	        this.DisableForeignKeyConstraintWhenMigrating = source["DisableForeignKeyConstraintWhenMigrating"];
	        this.IgnoreRelationshipsWhenMigrating = source["IgnoreRelationshipsWhenMigrating"];
	        this.DisableNestedTransaction = source["DisableNestedTransaction"];
	        this.AllowGlobalUpdate = source["AllowGlobalUpdate"];
	        this.QueryFields = source["QueryFields"];
	        this.CreateBatchSize = source["CreateBatchSize"];
	        this.TranslateError = source["TranslateError"];
	        this.PropagateUnscoped = source["PropagateUnscoped"];
	        this.ClauseBuilders = source["ClauseBuilders"];
	        this.ConnPool = source["ConnPool"];
	        this.Dialector = source["Dialector"];
	        this.Plugins = source["Plugins"];
	        this.Error = source["Error"];
	        this.RowsAffected = source["RowsAffected"];
	        this.Statement = this.convertValues(source["Statement"], Statement);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	

}

export namespace models {
	
	export class BillLineItem {
	    id: number[];
	    bill_id: number[];
	    description: string;
	    amount: number;
	    // Go type: time
	    created_at: any;
	
	    static createFrom(source: any = {}) {
	        return new BillLineItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.bill_id = source["bill_id"];
	        this.description = source["description"];
	        this.amount = source["amount"];
	        this.created_at = this.convertValues(source["created_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RoomType {
	    id: number[];
	    user_id: number[];
	    name: string;
	    default_rate: number;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new RoomType(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.user_id = source["user_id"];
	        this.name = source["name"];
	        this.default_rate = source["default_rate"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Room {
	    id: number[];
	    user_id: number[];
	    room_number: string;
	    type_id: number[];
	    type?: RoomType;
	    status: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Room(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.user_id = source["user_id"];
	        this.room_number = source["room_number"];
	        this.type_id = source["type_id"];
	        this.type = this.convertValues(source["type"], RoomType);
	        this.status = source["status"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Reservation {
	    id: number[];
	    user_id: number[];
	    customer_id: number[];
	    customer?: Customer;
	    room_id: number[];
	    room?: Room;
	    check_in_date: string;
	    actual_check_in_date?: string;
	    expected_check_out_date: string;
	    actual_check_out_date?: string;
	    status: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Reservation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.user_id = source["user_id"];
	        this.customer_id = source["customer_id"];
	        this.customer = this.convertValues(source["customer"], Customer);
	        this.room_id = source["room_id"];
	        this.room = this.convertValues(source["room"], Room);
	        this.check_in_date = source["check_in_date"];
	        this.actual_check_in_date = source["actual_check_in_date"];
	        this.expected_check_out_date = source["expected_check_out_date"];
	        this.actual_check_out_date = source["actual_check_out_date"];
	        this.status = source["status"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Customer {
	    id: number[];
	    user_id: number[];
	    full_name: string;
	    phone: string;
	    address: string;
	    id_proof_type: string;
	    id_proof_number: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Customer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.user_id = source["user_id"];
	        this.full_name = source["full_name"];
	        this.phone = source["phone"];
	        this.address = source["address"];
	        this.id_proof_type = source["id_proof_type"];
	        this.id_proof_number = source["id_proof_number"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Bill {
	    id: number[];
	    user_id: number[];
	    customer_id: number[];
	    customer?: Customer;
	    reservation_id?: number[];
	    reservation?: Reservation;
	    bill_type: string;
	    bill_date: string;
	    invoice_number: string;
	    is_gst_bill: boolean;
	    subtotal: number;
	    tax_amount: number;
	    discount_amount: number;
	    total_amount: number;
	    status: string;
	    generated_by: number[];
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	    line_items?: BillLineItem[];
	
	    static createFrom(source: any = {}) {
	        return new Bill(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.user_id = source["user_id"];
	        this.customer_id = source["customer_id"];
	        this.customer = this.convertValues(source["customer"], Customer);
	        this.reservation_id = source["reservation_id"];
	        this.reservation = this.convertValues(source["reservation"], Reservation);
	        this.bill_type = source["bill_type"];
	        this.bill_date = source["bill_date"];
	        this.invoice_number = source["invoice_number"];
	        this.is_gst_bill = source["is_gst_bill"];
	        this.subtotal = source["subtotal"];
	        this.tax_amount = source["tax_amount"];
	        this.discount_amount = source["discount_amount"];
	        this.total_amount = source["total_amount"];
	        this.status = source["status"];
	        this.generated_by = source["generated_by"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.line_items = this.convertValues(source["line_items"], BillLineItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class Payment {
	    id: number[];
	    bill_id: number[];
	    bill?: Bill;
	    amount: number;
	    payment_method: string;
	    payment_date: string;
	    // Go type: time
	    created_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Payment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.bill_id = source["bill_id"];
	        this.bill = this.convertValues(source["bill"], Bill);
	        this.amount = source["amount"];
	        this.payment_method = source["payment_method"];
	        this.payment_date = source["payment_date"];
	        this.created_at = this.convertValues(source["created_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	export class Settings {
	    id: number[];
	    user_id: number[];
	    lodge_name: string;
	    address: string;
	    phone: string;
	    gst_number: string;
	    state_name: string;
	    state_code: string;
	    gst_invoice_prefix: string;
	    gst_invoice_next_number: number;
	    non_gst_invoice_prefix: string;
	    non_gst_invoice_next_number: number;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Settings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.user_id = source["user_id"];
	        this.lodge_name = source["lodge_name"];
	        this.address = source["address"];
	        this.phone = source["phone"];
	        this.gst_number = source["gst_number"];
	        this.state_name = source["state_name"];
	        this.state_code = source["state_code"];
	        this.gst_invoice_prefix = source["gst_invoice_prefix"];
	        this.gst_invoice_next_number = source["gst_invoice_next_number"];
	        this.non_gst_invoice_prefix = source["non_gst_invoice_prefix"];
	        this.non_gst_invoice_next_number = source["non_gst_invoice_next_number"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class User {
	    id: number[];
	    username: string;
	    role: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.username = source["username"];
	        this.role = source["role"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace reflect {
	
	export class StructField {
	    Name: string;
	    PkgPath: string;
	    Type: any;
	    Tag: string;
	    Offset: any;
	    Index: number[];
	    Anonymous: boolean;
	
	    static createFrom(source: any = {}) {
	        return new StructField(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.PkgPath = source["PkgPath"];
	        this.Type = source["Type"];
	        this.Tag = source["Tag"];
	        this.Offset = source["Offset"];
	        this.Index = source["Index"];
	        this.Anonymous = source["Anonymous"];
	    }
	}

}

export namespace schema {
	
	export class Reference {
	    PrimaryKey?: Field;
	    PrimaryValue: string;
	    ForeignKey?: Field;
	    OwnPrimaryKey: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Reference(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.PrimaryKey = this.convertValues(source["PrimaryKey"], Field);
	        this.PrimaryValue = source["PrimaryValue"];
	        this.ForeignKey = this.convertValues(source["ForeignKey"], Field);
	        this.OwnPrimaryKey = source["OwnPrimaryKey"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Polymorphic {
	    PolymorphicID?: Field;
	    PolymorphicType?: Field;
	    Value: string;
	
	    static createFrom(source: any = {}) {
	        return new Polymorphic(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.PolymorphicID = this.convertValues(source["PolymorphicID"], Field);
	        this.PolymorphicType = this.convertValues(source["PolymorphicType"], Field);
	        this.Value = source["Value"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Relationship {
	    Name: string;
	    Type: string;
	    Field?: Field;
	    Polymorphic?: Polymorphic;
	    References: Reference[];
	    Schema?: Schema;
	    FieldSchema?: Schema;
	    JoinTable?: Schema;
	
	    static createFrom(source: any = {}) {
	        return new Relationship(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Type = source["Type"];
	        this.Field = this.convertValues(source["Field"], Field);
	        this.Polymorphic = this.convertValues(source["Polymorphic"], Polymorphic);
	        this.References = this.convertValues(source["References"], Reference);
	        this.Schema = this.convertValues(source["Schema"], Schema);
	        this.FieldSchema = this.convertValues(source["FieldSchema"], Schema);
	        this.JoinTable = this.convertValues(source["JoinTable"], Schema);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Relationships {
	    HasOne: Relationship[];
	    BelongsTo: Relationship[];
	    HasMany: Relationship[];
	    Many2Many: Relationship[];
	    Relations: Record<string, Relationship>;
	    EmbeddedRelations: Record<string, Relationships>;
	    // Go type: sync
	    Mux: any;
	
	    static createFrom(source: any = {}) {
	        return new Relationships(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.HasOne = this.convertValues(source["HasOne"], Relationship);
	        this.BelongsTo = this.convertValues(source["BelongsTo"], Relationship);
	        this.HasMany = this.convertValues(source["HasMany"], Relationship);
	        this.Many2Many = this.convertValues(source["Many2Many"], Relationship);
	        this.Relations = this.convertValues(source["Relations"], Relationship, true);
	        this.EmbeddedRelations = this.convertValues(source["EmbeddedRelations"], Relationships, true);
	        this.Mux = this.convertValues(source["Mux"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Schema {
	    Name: string;
	    ModelType: any;
	    Table: string;
	    PrioritizedPrimaryField?: Field;
	    DBNames: string[];
	    PrimaryFields: Field[];
	    PrimaryFieldDBNames: string[];
	    Fields: Field[];
	    FieldsByName: Record<string, Field>;
	    FieldsByBindName: Record<string, Field>;
	    FieldsByDBName: Record<string, Field>;
	    FieldsWithDefaultDBValue: Field[];
	    Relationships: Relationships;
	    CreateClauses: any[];
	    QueryClauses: any[];
	    UpdateClauses: any[];
	    DeleteClauses: any[];
	    BeforeCreate: boolean;
	    AfterCreate: boolean;
	    BeforeUpdate: boolean;
	    AfterUpdate: boolean;
	    BeforeDelete: boolean;
	    AfterDelete: boolean;
	    BeforeSave: boolean;
	    AfterSave: boolean;
	    AfterFind: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Schema(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.ModelType = source["ModelType"];
	        this.Table = source["Table"];
	        this.PrioritizedPrimaryField = this.convertValues(source["PrioritizedPrimaryField"], Field);
	        this.DBNames = source["DBNames"];
	        this.PrimaryFields = this.convertValues(source["PrimaryFields"], Field);
	        this.PrimaryFieldDBNames = source["PrimaryFieldDBNames"];
	        this.Fields = this.convertValues(source["Fields"], Field);
	        this.FieldsByName = this.convertValues(source["FieldsByName"], Field, true);
	        this.FieldsByBindName = this.convertValues(source["FieldsByBindName"], Field, true);
	        this.FieldsByDBName = this.convertValues(source["FieldsByDBName"], Field, true);
	        this.FieldsWithDefaultDBValue = this.convertValues(source["FieldsWithDefaultDBValue"], Field);
	        this.Relationships = this.convertValues(source["Relationships"], Relationships);
	        this.CreateClauses = source["CreateClauses"];
	        this.QueryClauses = source["QueryClauses"];
	        this.UpdateClauses = source["UpdateClauses"];
	        this.DeleteClauses = source["DeleteClauses"];
	        this.BeforeCreate = source["BeforeCreate"];
	        this.AfterCreate = source["AfterCreate"];
	        this.BeforeUpdate = source["BeforeUpdate"];
	        this.AfterUpdate = source["AfterUpdate"];
	        this.BeforeDelete = source["BeforeDelete"];
	        this.AfterDelete = source["AfterDelete"];
	        this.BeforeSave = source["BeforeSave"];
	        this.AfterSave = source["AfterSave"];
	        this.AfterFind = source["AfterFind"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Field {
	    Name: string;
	    DBName: string;
	    BindNames: string[];
	    EmbeddedBindNames: string[];
	    DataType: string;
	    GORMDataType: string;
	    PrimaryKey: boolean;
	    AutoIncrement: boolean;
	    AutoIncrementIncrement: number;
	    Creatable: boolean;
	    Updatable: boolean;
	    Readable: boolean;
	    AutoCreateTime: number;
	    AutoUpdateTime: number;
	    HasDefaultValue: boolean;
	    DefaultValue: string;
	    DefaultValueInterface: any;
	    NotNull: boolean;
	    Unique: boolean;
	    Comment: string;
	    Size: number;
	    Precision: number;
	    Scale: number;
	    IgnoreMigration: boolean;
	    FieldType: any;
	    IndirectFieldType: any;
	    StructField: reflect.StructField;
	    Tag: string;
	    TagSettings: Record<string, string>;
	    Schema?: Schema;
	    EmbeddedSchema?: Schema;
	    OwnerSchema?: Schema;
	    Serializer: any;
	    NewValuePool: any;
	    UniqueIndex: string;
	
	    static createFrom(source: any = {}) {
	        return new Field(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.DBName = source["DBName"];
	        this.BindNames = source["BindNames"];
	        this.EmbeddedBindNames = source["EmbeddedBindNames"];
	        this.DataType = source["DataType"];
	        this.GORMDataType = source["GORMDataType"];
	        this.PrimaryKey = source["PrimaryKey"];
	        this.AutoIncrement = source["AutoIncrement"];
	        this.AutoIncrementIncrement = source["AutoIncrementIncrement"];
	        this.Creatable = source["Creatable"];
	        this.Updatable = source["Updatable"];
	        this.Readable = source["Readable"];
	        this.AutoCreateTime = source["AutoCreateTime"];
	        this.AutoUpdateTime = source["AutoUpdateTime"];
	        this.HasDefaultValue = source["HasDefaultValue"];
	        this.DefaultValue = source["DefaultValue"];
	        this.DefaultValueInterface = source["DefaultValueInterface"];
	        this.NotNull = source["NotNull"];
	        this.Unique = source["Unique"];
	        this.Comment = source["Comment"];
	        this.Size = source["Size"];
	        this.Precision = source["Precision"];
	        this.Scale = source["Scale"];
	        this.IgnoreMigration = source["IgnoreMigration"];
	        this.FieldType = source["FieldType"];
	        this.IndirectFieldType = source["IndirectFieldType"];
	        this.StructField = this.convertValues(source["StructField"], reflect.StructField);
	        this.Tag = source["Tag"];
	        this.TagSettings = source["TagSettings"];
	        this.Schema = this.convertValues(source["Schema"], Schema);
	        this.EmbeddedSchema = this.convertValues(source["EmbeddedSchema"], Schema);
	        this.OwnerSchema = this.convertValues(source["OwnerSchema"], Schema);
	        this.Serializer = source["Serializer"];
	        this.NewValuePool = source["NewValuePool"];
	        this.UniqueIndex = source["UniqueIndex"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	

}

export namespace session {
	
	export class Session {
	
	
	    static createFrom(source: any = {}) {
	        return new Session(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

