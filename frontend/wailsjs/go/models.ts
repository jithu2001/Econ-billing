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

