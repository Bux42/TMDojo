export const STATUS_CODE_IDS = {
    400: 'BadRequest',
    401: 'Unauthorized',
    402: 'PaymentRequired',
    403: 'Forbidden',
    404: 'NotFound',
    405: 'MethodNotAllowed',
    406: 'NotAcceptable',
    407: 'ProxyAuthenticationRequired',
    408: 'RequestTimeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'LengthRequired',
    412: 'PreconditionFailed',
    413: 'PayloadTooLarge',
    414: 'URITooLong',
    415: 'UnsupportedMediaType',
    416: 'RangeNotSatisfiable',
    417: 'ExpectationFailed',
    418: 'ImATeapot',
    421: 'MisdirectedRequest',
    422: 'UnprocessableEntity',
    423: 'Locked',
    424: 'FailedDependency',
    425: 'TooEarly',
    426: 'UpgradeRequired',
    428: 'PreconditionRequired',
    429: 'TooManyRequests',
    431: 'RequestHeaderFieldsTooLarge',
    451: 'UnavailableForLegalReasons',
    500: 'InternalServerError',
    501: 'NotImplemented',
    502: 'BadGateway',
    503: 'ServiceUnavailable',
    504: 'GatewayTimeout',
    505: 'HTTPVersionNotSupported',
    506: 'VariantAlsoNegotiates',
    507: 'InsufficientStorage',
    508: 'LoopDetected',
    509: 'BandwidthLimitExceeded',
    510: 'NotExtended',
    511: 'NetworkAuthenticationRequired',
} as const;

type ErrorStatusCode = keyof typeof STATUS_CODE_IDS;

export const STATUS_CODE_NAMES: { [key in ErrorStatusCode]: string } = {
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: 'Im A Teapot',
    421: 'Misdirected Request',
    422: 'Unprocessable Entity',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Too Early',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    509: 'Bandwidth Limit Exceeded',
    510: 'Not Extended',
    511: 'Network Authentication Required',
} as const;

export class HttpError extends Error {
    public readonly status: ErrorStatusCode;
    public readonly statusCode: ErrorStatusCode;
    public readonly statusName: typeof STATUS_CODE_NAMES[ErrorStatusCode];
    public readonly payload?: object | string;

    constructor(statusCode: ErrorStatusCode, payload?: object | string) {
        super(`HTTP Error Occurred: ${statusCode} - ${STATUS_CODE_NAMES[statusCode]}`);
        this.status = statusCode;
        this.statusCode = statusCode;
        this.statusName = STATUS_CODE_NAMES[statusCode];
        this.payload = payload;
    }

    public responseBody() {
        return ({
            status: this.status,
            message: this.statusName,
            error: this.payload ? this.payload : undefined,
        });
    }
}
