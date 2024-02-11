iMessageGPT
=================

Ask GPT questions about your iMessage history.

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g imessagegpt
$ imsg COMMAND
running command...
$ imsg (--version)
imessagegpt/0.0.0 darwin-x64 node-v21.5.0
$ imsg --help [COMMAND]
USAGE
  $ imsg COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`imsg chat analyze NAME`](#imsg-chat-analyze-name)
* [`imsg chat ask NAME`](#imsg-chat-ask-name)
* [`imsg chat delete NAME`](#imsg-chat-delete-name)
* [`imsg chat list`](#imsg-chat-list)
* [`imsg chat scan`](#imsg-chat-scan)
* [`imsg config init`](#imsg-config-init)
* [`imsg help [COMMANDS]`](#imsg-help-commands)

## `imsg chat analyze NAME`

Gives a general overview of a chat

```
USAGE
  $ imsg chat analyze NAME

ARGUMENTS
  NAME  Name of the person in the chat

DESCRIPTION
  Gives a general overview of a chat

EXAMPLES
  $ imsg chat analyze "John"
```

_See code: [src/commands/chat/analyze.ts](https://github.com/gadhagod/iMessageGPT/blob/v0.0.0/src/commands/chat/analyze.ts)_

## `imsg chat ask NAME`

Ask a question about a chat

```
USAGE
  $ imsg chat ask NAME

ARGUMENTS
  NAME  Name of the person in the chat

DESCRIPTION
  Ask a question about a chat

EXAMPLES
  $ imsg chat ask "John"
```

_See code: [src/commands/chat/ask.ts](https://github.com/gadhagod/iMessageGPT/blob/v0.0.0/src/commands/chat/ask.ts)_

## `imsg chat delete NAME`

Deletes a chat that has been scanned

```
USAGE
  $ imsg chat delete NAME

ARGUMENTS
  NAME  Name of the person in the chat

DESCRIPTION
  Deletes a chat that has been scanned

EXAMPLES
  $ imsg chat delete "John"
```

_See code: [src/commands/chat/delete.ts](https://github.com/gadhagod/iMessageGPT/blob/v0.0.0/src/commands/chat/delete.ts)_

## `imsg chat list`

Lists all chats that have been scanned

```
USAGE
  $ imsg chat list

DESCRIPTION
  Lists all chats that have been scanned

EXAMPLES
  $ imsg chat list
```

_See code: [src/commands/chat/list.ts](https://github.com/gadhagod/iMessageGPT/blob/v0.0.0/src/commands/chat/list.ts)_

## `imsg chat scan`

Scans a chat and stores its data

```
USAGE
  $ imsg chat scan [-d <value>]

FLAGS
  -d, --chatDb=<value>  [default: /Users/25aaravb/Library/Messages/chat.db] Path of .db file containing messages

DESCRIPTION
  Scans a chat and stores its data

EXAMPLES
  $ imsg chat scan
```

_See code: [src/commands/chat/scan.ts](https://github.com/gadhagod/iMessageGPT/blob/v0.0.0/src/commands/chat/scan.ts)_

## `imsg config init`

Creates a configuration directory

```
USAGE
  $ imsg config init -k <value> [-a <value>] [-r <value>] [-l <value>]

FLAGS
  -a, --openAiApiKey=<value>
  -k, --openAIApiKey=<value>  (required) API key for OpenAI
  -l, --leafCount=<value>     [default: 100] Number of messages around each root to use for conversation context
  -r, --rootCount=<value>     [default: 5] Number of roots

DESCRIPTION
  Creates a configuration directory

EXAMPLES
  $ imsg config init -k "openai apikey"
```

_See code: [src/commands/config/init.ts](https://github.com/gadhagod/iMessageGPT/blob/v0.0.0/src/commands/config/init.ts)_

## `imsg help [COMMANDS]`

Display help for imsg.

```
USAGE
  $ imsg help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for imsg.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.11/src/commands/help.ts)_
<!-- commandsstop -->
