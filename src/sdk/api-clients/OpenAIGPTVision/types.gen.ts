// Use these request functions from "./sdk.gen.ts" or "./index.ts":
//
//   /**
//    * Chat completion with image recognition
//    *
//    * Sends messages including images for analysis and receives JSON formatted responses
//    */
//   export function postV1AiZWwyutGgvEgWwzSaChatCompletions(opts: PostV1AiZWwyutGgvEgWwzSaChatCompletionsData): Promise<{
//     error?: PostV1AiZWwyutGgvEgWwzSaChatCompletionsErrors[keyof PostV1AiZWwyutGgvEgWwzSaChatCompletionsErrors],
//     data?: PostV1AiZWwyutGgvEgWwzSaChatCompletionsResponses[keyof PostV1AiZWwyutGgvEgWwzSaChatCompletionsResponses],
//     request: Request,
//     response: Response }>;
//
//
// NOTICE: Please use default values from original openapi schema:
//
//    {
//      "openapi": "3.0.0",
//      "info": {
//        "title": "GenAI Image Recognition API",
//        "description": "API for image recognition and analysis with chat completions",
//        "version": "1.0.0"
//      },
//      "servers": [
//        {
//          "url": "https://api-production.creao.ai/execute-apis/v2",
//          "description": "Production server"
//        }
//      ],
//      "paths": {
//        "/v1/ai/zWwyutGgvEGWwzSa/chat/completions": {
//          "post": {
//            "summary": "Chat completion with image recognition",
//            "description": "Sends messages including images for analysis and receives JSON formatted responses",
//            "security": [
//              {
//                "BearerAuth": []
//              }
//            ],
//            "requestBody": {
//              "required": true,
//              "content": {
//                "application/json": {
//                  "schema": {
//                    "type": "object",
//                    "required": [
//                      "messages"
//                    ],
//                    "properties": {
//                      "messages": {
//                        "type": "array",
//                        "items": {
//                          "type": "object",
//                          "properties": {
//                            "role": {
//                              "type": "string",
//                              "enum": [
//                                "user"
//                              ]
//                            },
//                            "content": {
//                              "type": "array",
//                              "items": {
//                                "oneOf": [
//                                  {
//                                    "type": "object",
//                                    "properties": {
//                                      "type": {
//                                        "type": "string",
//                                        "enum": [
//                                          "text"
//                                        ]
//                                      },
//                                      "text": {
//                                        "type": "string",
//                                        "description": "Text content for the message",
//                                        "example": "Please analyze this image and provide a detailed description of what you see."
//                                      }
//                                    },
//                                    "required": [
//                                      "type",
//                                      "text"
//                                    ]
//                                  },
//                                  {
//                                    "type": "object",
//                                    "properties": {
//                                      "type": {
//                                        "type": "string",
//                                        "enum": [
//                                          "image_url"
//                                        ]
//                                      },
//                                      "image_url": {
//                                        "type": "object",
//                                        "properties": {
//                                          "url": {
//                                            "type": "string",
//                                            "format": "uri",
//                                            "description": "The URL of the image to analyze (variable field)"
//                                          }
//                                        },
//                                        "required": [
//                                          "url"
//                                        ]
//                                      }
//                                    },
//                                    "required": [
//                                      "type",
//                                      "image_url"
//                                    ]
//                                  }
//                                ]
//                              }
//                            }
//                          },
//                          "required": [
//                            "role",
//                            "content"
//                          ]
//                        }
//                      },
//                      "stream": {
//                        "type": "boolean",
//                        "default": false,
//                        "description": "Whether to stream the response"
//                      }
//                    }
//                  }
//                }
//              }
//            },
//            "responses": {
//              "200": {
//                "description": "Successful response with image analysis",
//                "content": {
//                  "application/json": {
//                    "schema": {
//                      "type": "object",
//                      "properties": {
//                        "id": {
//                          "type": "string",
//                          "description": "Unique identifier for the chat completion",
//                          "example": "chatcmpl-BzgiUDuNrVlpI1KYMKIBw3PIBgyHX"
//                        },
//                        "choices": {
//                          "type": "array",
//                          "items": {
//                            "type": "object",
//                            "properties": {
//                              "index": {
//                                "type": "integer",
//                                "description": "The index of the choice in the list of choices"
//                              },
//                              "logprobs": {
//                                "nullable": true,
//                                "description": "Log probabilities (null if not requested)"
//                              },
//                              "message": {
//                                "type": "object",
//                                "properties": {
//                                  "role": {
//                                    "type": "string",
//                                    "enum": [
//                                      "assistant"
//                                    ],
//                                    "description": "The role of the author of this message"
//                                  },
//                                  "content": {
//                                    "type": "string",
//                                    "description": "The contents of the message"
//                                  },
//                                  "reasoning_content": {
//                                    "nullable": true,
//                                    "description": "Reasoning content (null if not provided)"
//                                  },
//                                  "function_call": {
//                                    "nullable": true,
//                                    "description": "Function call information (null if not applicable)"
//                                  },
//                                  "tool_calls": {
//                                    "nullable": true,
//                                    "description": "Tool calls information (null if not applicable)"
//                                  },
//                                  "reasoning_details": {
//                                    "nullable": true,
//                                    "description": "Reasoning details (null if not provided)"
//                                  }
//                                },
//                                "required": [
//                                  "role",
//                                  "content"
//                                ]
//                              },
//                              "finish_reason": {
//                                "type": "string",
//                                "description": "The reason the model stopped generating tokens",
//                                "enum": [
//                                  "stop",
//                                  "length",
//                                  "function_call",
//                                  "tool_calls",
//                                  "content_filter"
//                                ]
//                              },
//                              "native_finish_reason": {
//                                "nullable": true,
//                                "description": "Native finish reason (null if not applicable)"
//                              }
//                            },
//                            "required": [
//                              "index",
//                              "message",
//                              "finish_reason"
//                            ]
//                          }
//                        },
//                        "created": {
//                          "type": "integer",
//                          "format": "int64",
//                          "description": "The Unix timestamp (in seconds) when the chat completion was created"
//                        },
//                        "model": {
//                          "type": "string",
//                          "description": "The model used for the completion",
//                          "example": "MaaS_4.1"
//                        },
//                        "object": {
//                          "type": "string",
//                          "description": "The object type, which is always 'chat.completion'",
//                          "enum": [
//                            "chat.completion"
//                          ]
//                        },
//                        "system_fingerprint": {
//                          "nullable": true,
//                          "description": "System fingerprint (null if not provided)"
//                        },
//                        "usage": {
//                          "type": "object",
//                          "properties": {
//                            "prompt_tokens": {
//                              "type": "integer",
//                              "description": "Number of tokens in the prompt"
//                            },
//                            "completion_tokens": {
//                              "type": "integer",
//                              "description": "Number of tokens in the generated completion"
//                            },
//                            "total_tokens": {
//                              "type": "integer",
//                              "description": "Total number of tokens used in the request (prompt + completion)"
//                            },
//                            "completion_tokens_details": {
//                              "type": "object",
//                              "properties": {
//                                "reasoning_tokens": {
//                                  "type": "integer",
//                                  "description": "Number of reasoning tokens used"
//                                }
//                              }
//                            },
//                            "prompt_tokens_details": {
//                              "nullable": true,
//                              "description": "Detailed breakdown of prompt tokens (null if not provided)"
//                            }
//                          },
//                          "required": [
//                            "prompt_tokens",
//                            "completion_tokens",
//                            "total_tokens"
//                          ]
//                        }
//                      },
//                      "required": [
//                        "id",
//                        "choices",
//                        "created",
//                        "model",
//                        "object",
//                        "usage"
//                      ]
//                    }
//                  }
//                }
//              },
//              "400": {
//                "description": "Bad request - invalid input parameters"
//              },
//              "401": {
//                "description": "Unauthorized - invalid or missing token"
//              }
//            },
//            "parameters": [
//              {
//                "$ref": "#/components/parameters/CreaoApiNameHeader"
//              },
//              {
//                "$ref": "#/components/parameters/CreaoApiPathHeader"
//              },
//              {
//                "$ref": "#/components/parameters/CreaoApiIdHeader"
//              }
//            ]
//          }
//        }
//      },
//      "components": {
//        "securitySchemes": {
//          "BearerAuth": {
//            "type": "http",
//            "scheme": "bearer",
//            "description": "Bearer token for authentication",
//            "bearerFormat": "JWT",
//            "x-bearer-token": "BXuSPHRhErkTPwFTiLff"
//          }
//        },
//        "parameters": {
//          "CreaoApiNameHeader": {
//            "name": "X-CREAO-API-NAME",
//            "in": "header",
//            "required": true,
//            "schema": {
//              "type": "string",
//              "default": "OpenAIGPTVision"
//            },
//            "description": "API name identifier - must be \"OpenAIGPTVision\""
//          },
//          "CreaoApiIdHeader": {
//            "name": "X-CREAO-API-ID",
//            "in": "header",
//            "required": true,
//            "schema": {
//              "type": "string",
//              "default": "68a5655cdeb2a0b2f64c013d"
//            },
//            "description": "API ID identifier - must be \"68a5655cdeb2a0b2f64c013d\""
//          },
//          "CreaoApiPathHeader": {
//            "name": "X-CREAO-API-PATH",
//            "in": "header",
//            "required": true,
//            "schema": {
//              "type": "string",
//              "default": "/v1/ai/zWwyutGgvEGWwzSa/chat/completions"
//            },
//            "description": "API path identifier - must be \"/v1/ai/zWwyutGgvEGWwzSa/chat/completions\""
//          }
//        }
//      }
//    }
//
// 

export type ClientOptions = {
    baseUrl: 'https://api-production.creao.ai/execute-apis/v2' | (string & {});
};

/**
 * API name identifier - must be "OpenAIGPTVision"
 */
export type CreaoApiNameHeader = string;

/**
 * API ID identifier - must be "68a5655cdeb2a0b2f64c013d"
 */
export type CreaoApiIdHeader = string;

/**
 * API path identifier - must be "/v1/ai/zWwyutGgvEGWwzSa/chat/completions"
 */
export type CreaoApiPathHeader = string;

export type PostV1AiZWwyutGgvEgWwzSaChatCompletionsData = {
    body: {
        messages: Array<{
            role: 'user';
            content: Array<{
                type: 'text';
                /**
                 * Text content for the message
                 */
                text: string;
            } | {
                type: 'image_url';
                image_url: {
                    /**
                     * The URL of the image to analyze (variable field)
                     */
                    url: string;
                };
            }>;
        }>;
        /**
         * Whether to stream the response
         */
        stream?: boolean;
    };
    headers: {
        /**
         * API name identifier - must be "OpenAIGPTVision"
         */
        'X-CREAO-API-NAME': string;
        /**
         * API path identifier - must be "/v1/ai/zWwyutGgvEGWwzSa/chat/completions"
         */
        'X-CREAO-API-PATH': string;
        /**
         * API ID identifier - must be "68a5655cdeb2a0b2f64c013d"
         */
        'X-CREAO-API-ID': string;
    };
    path?: never;
    query?: never;
    url: '/v1/ai/zWwyutGgvEGWwzSa/chat/completions';
};

export type PostV1AiZWwyutGgvEgWwzSaChatCompletionsErrors = {
    /**
     * Bad request - invalid input parameters
     */
    400: unknown;
    /**
     * Unauthorized - invalid or missing token
     */
    401: unknown;
};

export type PostV1AiZWwyutGgvEgWwzSaChatCompletionsResponses = {
    /**
     * Successful response with image analysis
     */
    200: {
        /**
         * Unique identifier for the chat completion
         */
        id: string;
        choices: Array<{
            /**
             * The index of the choice in the list of choices
             */
            index: number;
            /**
             * Log probabilities (null if not requested)
             */
            logprobs?: unknown;
            message: {
                /**
                 * The role of the author of this message
                 */
                role: 'assistant';
                /**
                 * The contents of the message
                 */
                content: string;
                /**
                 * Reasoning content (null if not provided)
                 */
                reasoning_content?: unknown;
                /**
                 * Function call information (null if not applicable)
                 */
                function_call?: unknown;
                /**
                 * Tool calls information (null if not applicable)
                 */
                tool_calls?: unknown;
                /**
                 * Reasoning details (null if not provided)
                 */
                reasoning_details?: unknown;
            };
            /**
             * The reason the model stopped generating tokens
             */
            finish_reason: 'stop' | 'length' | 'function_call' | 'tool_calls' | 'content_filter';
            /**
             * Native finish reason (null if not applicable)
             */
            native_finish_reason?: unknown;
        }>;
        /**
         * The Unix timestamp (in seconds) when the chat completion was created
         */
        created: number;
        /**
         * The model used for the completion
         */
        model: string;
        /**
         * The object type, which is always 'chat.completion'
         */
        object: 'chat.completion';
        /**
         * System fingerprint (null if not provided)
         */
        system_fingerprint?: unknown;
        usage: {
            /**
             * Number of tokens in the prompt
             */
            prompt_tokens: number;
            /**
             * Number of tokens in the generated completion
             */
            completion_tokens: number;
            /**
             * Total number of tokens used in the request (prompt + completion)
             */
            total_tokens: number;
            completion_tokens_details?: {
                /**
                 * Number of reasoning tokens used
                 */
                reasoning_tokens?: number;
            };
            /**
             * Detailed breakdown of prompt tokens (null if not provided)
             */
            prompt_tokens_details?: unknown;
        };
    };
};

export type PostV1AiZWwyutGgvEgWwzSaChatCompletionsResponse = PostV1AiZWwyutGgvEgWwzSaChatCompletionsResponses[keyof PostV1AiZWwyutGgvEgWwzSaChatCompletionsResponses];
