# Obsidian Language Tools

A set of utilities for taking language notes in Obsidian.

## Prerequisite

This plugin requires [Obsidian Dataview](https://github.com/blacksmithgu/obsidian-dataview) to be installed.

## Tools

### Vocabulary Extractor

Extract vocabulary to it's own card. This will replace the selected text with a link to the card. The link will persist even when changing the title of the new card.
The template to use for every card, can be set in the settings menu.

### Fragment Extractor

Sometimes a text is too big to learn in one go. This utility will extract the selected text to a template you can chose in the settings menu, and embeds it in the current document.

### Dictionary Lookup

Let's you open the highlighted text in any of your preferred dictionary sites.

### "SRS" Panel

Let's you review all vocabulary of the active document in an SRS like panel. For this to work the following dataview fields need to be set on the target card notes.

-   `card: vocab`
-   `spelling`
-   `translations`
-   `status`

See the example template below to get an idea on how to incorporate those fields in your cards.

|                              |                               |
| ---------------------------- | ----------------------------- |
| ![image](/preview/srs_1.png) | ![image](/preview//srs_2.png) |

## Example Workflow

For every text, I create an index page and then split the text in fragments and add a new Note with the fragment. The plugin automatically creates a new Note with the correct naming and links the selected part back to the original index page. There I link the part of the audio for this fragment and start marking new vocabulary, which auto creates a new vocabulary note. At the end of each fragment note is a dataview with all the vocabulary added.
| | |
| ---------------------------- | ----------------------------- |
| ![image](/preview/p1.png) | ![image](/preview/p2.png) |
| ![image](/preview/p3.png) | ![image](/preview/p4.png) |
| ![image](/preview/p5.png) | ![image](/preview/p6.png) |

## Audio Player

I forked the audio player plugin and added chapter support, so I can link the audio either in full or just parts of the same audio file, and changed up the visualization a bit. You can get it [here](https://github.com/Yidaotus/obsidian-enhanced-audio-player/)

## Example Vocab Template

```md
---
language: 日本語
type: card
card: vocab
cssclasses:
    - list-cards
    - cards-2-1
---

-   🗣️ (Spelling:: )
-   📖 (Translations:: )
-   🚧 (Status:: 🟩 | 🟨 | 🟥 )
-   ✍️ (Comment:: )

### 💭 Mnemonic

### 🪜Examples
```

## Example Fragment Template

````md
---
language: 日本語
type: text_resource_part
status: 🟨 🟥
source:
cssclasses:
    - cards-1-1
---

{{fragment}}

## Notes

## Vocab

```dataview
TABLE without id file.link as "Vocab", spelling as Spelling, translations as "Translation" FROM outgoing([[]]) WHERE card
```

> [!translation]- English
>
> ```
>
> ```
````
