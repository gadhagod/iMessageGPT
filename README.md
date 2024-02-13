iMessageGPT
=================

Ask GPT questions about your iMessage history.

![https://www.youtube.com/watch?v=ABdvXmSXd94](https://s13.gifyu.com/images/SCAj1.gif)

## Installation

```
npm i -g imessagegpt
```

Verify installation with:

```
imsg --help
```

## Usage
1. ### Set up permissions
Allow terminal access to `~/Library/Messages/chat.db`, which is where iMessages are stored. From `System Preferences > Security & Privacy > Privacy > Full Disk Access`, allow "full disk access" for your terminal. See [this video](https://www.youtube.com/watch?v=10XP36ZT_iM) for a demonstration of how to do this. 

2. ### Create config file
Now, initialize your config directory with `imsg config init`. Pass in your [OpenAI api key](https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key) to the `--openAIApiKey` or `-k` flag. You will be prompted a for your name, which will the LLM will use to distinguish you and the other person in the chat. The config directory will be stored at `~/.imessagegpt`.

```
$ imsg config init -k "key"

What is your name?: John
Created config file at /Users/25John/.imsg-analyzer/config.json
```

3. ### Scan the chat
Next, scan the chat you would like to query with `imsg chat scan`. You will be prompted the name of the other person in the chat, used by the LLM to distinguish the two members of the chat. You will be prompted to enter a message that the other person in the chat has sent, to retrieve their iMessage [handle ID](https://medium.com/@yaskalidis/heres-how-you-can-access-your-entire-imessage-history-on-your-mac-f8878276c6e9#:~:text=Getting%20the%20message%20text%20and%20phone%20number&text=After%20a%20little%20exploration%20I,handle%20and%20join%20on%20handle_id.) for your system. 

You will then be asked to describe the relationship between you and the other person, passed as context into the LLM. The relationship description should be in third person, as shown. The more detailed your description is, the better the LLM performs.

This command reads the `chat.db` file, builds a [USearch](https://unum-cloud.github.io/usearch) index, and saves it into the config directory. 

```
$ imsg chat scan

What is the other person's name?: Sarah
What is the relationship between John and Sarah?: John and Sarah are friends from high school.
Enter a message Sarah sent to you: You free for lunch tomorrow at 2? 

Are you referring to this message:
	On 2023-11-14 22:44:58:
	"You free for lunch tomorrow at 2?"
 
Type (y/n): y

Scanning... done
Chat scanned and saved. Run `imsg chat analyze Sarah` or `imsg chat ask Sarah` to query.
```

4. ### Query the chat
Ask questions about your chat history with `imsg chat ask`. Pass in the name specified in the `scan` command (case sensitive).

```
imsg chat ask "Sarah"    # query chat with Sarah

Prompt: Describe the relationship between John and Sarah.

Answer:
John and Sarah share a complex and dynamic relationship that borders on a close friendship...
```

You can now `scan` other chats and `ask` about them too!

<!-- toc -->
* [CLI Overview](#usage)
* [Commands](#commands)
<!-- tocstop -->
## Usage
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
## Commands
<!-- commands -->
* [`imsg chat analyze NAME`](#imsg-chat-analyze-name)
* [`imsg chat ask NAME`](#imsg-chat-ask-name)
* [`imsg chat delete NAME`](#imsg-chat-delete-name)
* [`imsg chat list`](#imsg-chat-list)
* [`imsg chat scan`](#imsg-chat-scan)
* [`imsg config init`](#imsg-config-init)
* [`imsg help [COMMANDS]`](#imsg-help-commands)

### `imsg chat analyze NAME`

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

### `imsg chat ask NAME`

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

### `imsg chat delete NAME`

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

### `imsg chat list`

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

### `imsg chat scan`

Scans a chat and stores its data

```
USAGE
  $ imsg chat scan [-d <value>]

FLAGS
  -d, --chatDb=<value>  [default: ~/Library/Messages/chat.db] Path of .db file containing messages

DESCRIPTION
  Scans a chat and stores its data

EXAMPLES
  $ imsg chat scan
```

_See code: [src/commands/chat/scan.ts](https://github.com/gadhagod/iMessageGPT/blob/v0.0.0/src/commands/chat/scan.ts)_

### `imsg config init`

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

### `imsg help [COMMANDS]`

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
