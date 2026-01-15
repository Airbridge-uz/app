import type {
  SuggestionsEventChunk,
  ThinkingEventChunk,
  TokenEventChunk,
} from "@/entities/chat-stream"
import type {
  ContentStreamChunk,
  ErrorStreamChunk,
  ThinkingStreamChunk,
} from "@tanstack/ai"
import { Result } from "neverthrow"
import { CryptoIdGenerator } from "./id-generator"

export abstract class EventParser {
  abstract parse<T = unknown>(data: string): Result<T, Error>
}

export class TokenParser implements EventParser {
  private readonly idGenerator = CryptoIdGenerator.new()

  parse<T = TokenEventChunk>(data: string): Result<T, Error> {
    return Result.fromThrowable(
      () => JSON.parse(data) as T,
      (e) => {
        if (e instanceof Error) return e
        return new Error("Unknown error during parsing", {
          cause: e,
        })
      },
    )()
  }

  self(): TokenParser {
    return this
  }

  static new(): TokenParser {
    return new TokenParser()
  }

  format(data: TokenEventChunk) {
    const id = this.idGenerator.generate()
    const timestamp = Date.now()

    return {
      id,
      timestamp,
      type: "content",
      delta: data.content || "",
      content: data.content || "",
      role: "assistant",
      model: "gpt-5.1",
    } satisfies ContentStreamChunk
  }
}

export class ThinkingParser implements EventParser {
  private readonly idGenerator = CryptoIdGenerator.new()

  parse<T = ThinkingEventChunk>(data: string): Result<T, Error> {
    return Result.fromThrowable(
      () => JSON.parse(data) as T,
      (e) => e as Error,
    )()
  }

  self(): ThinkingParser {
    return this
  }

  static new(): ThinkingParser {
    return new ThinkingParser()
  }

  format(data: ThinkingEventChunk) {
    const id = this.idGenerator.generate()
    const timestamp = Date.now()

    return {
      id,
      timestamp,
      type: "thinking",
      delta: data.steps.join("\n") || "",
      content: data.steps.join("\n") || "",
      model: "gpt-5.1",
    } satisfies ThinkingStreamChunk
  }
}

export class SuggestionsParser implements EventParser {
  private readonly idGenerator = CryptoIdGenerator.new()

  parse<T = SuggestionsEventChunk>(data: string): Result<T, Error> {
    return Result.fromThrowable(
      () => JSON.parse(data) as T,
      (e) => e as Error,
    )()
  }

  self(): SuggestionsParser {
    return this
  }

  static new(): SuggestionsParser {
    return new SuggestionsParser()
  }

  format(data: SuggestionsEventChunk) {
    const id = this.idGenerator.generate()
    const timestamp = Date.now()

    return {
      id,
      timestamp,
      type: "suggestions",
      role: "assistant",
      model: "gpt-5.1",
      delta: data,
      content: data,
    }
  }
}

export class ErrorChunkParser {
  private readonly idGenerator = CryptoIdGenerator.new()

  static new(): ErrorChunkParser {
    return new ErrorChunkParser()
  }

  self(): ErrorChunkParser {
    return this
  }

  format(errorMessage: string) {
    const id = this.idGenerator.generate()
    const timestamp = Date.now()

    return {
      id,
      timestamp,
      type: "error",
      model: "gpt-5.1",
      error: {
        message: errorMessage,
      },
    } satisfies ErrorStreamChunk
  }
}
