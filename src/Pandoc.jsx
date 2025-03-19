import { useEffect, useState, useCallback, useRef } from "react"

import MDEditor from "@uiw/react-md-editor";
import { ArrowBigRightDash, ArrowBigDownDash, Download, ClipboardX } from "lucide-react";
import hypercycle from "hypercyclejs";
import { useAccount } from 'wagmi';
import { ConnectKitButton } from "connectkit";
import JSConfetti from "js-confetti";

const aimSlot = import.meta.env.VITE_LLM_SLOT;
const nodeUrl = import.meta.env.VITE_NODE_URL;

const mkdStr = `
# Pandoc AIM Example


**An easy-to-use Pandoc converter for all your document needs.**

[![](https://avatars.githubusercontent.com/u/141808569?s=80&v=4)](https://github.com/hypercycle-community/)

---
\`\`\`javascript
import React from "react";
import hypercycle from "hypercyclejs";
\`\`\`
`;

const input_formats = ["commonmark", "creole", "csv", "docbook", "docx", "dokuwiki", "epub", "fb2", "gfm", "haddock", "html", "ipynb", "jats", "jira", "json", "latex", "man", "markdown", "markdown_github", "markdown_mmd", "markdown_phpextra", "markdown_strict", "mediawiki", "muse", "native", "odt", "opml", "org", "rst", "t2t", "textile", "tikiwiki", "twiki", "vimwiki"]
const output_formats = [
    { "name": "asciidoc", "extension": ".adoc", "friendly_name": "AsciiDoc" },
    { "name": "asciidoctor", "extension": ".adoc", "friendly_name": "AsciiDoctor" },
    { "name": "beamer", "extension": ".tex", "friendly_name": "Beamer (LaTeX)" },
    { "name": "commonmark", "extension": ".md", "friendly_name": "CommonMark" },
    { "name": "context", "extension": ".ctx", "friendly_name": "ConTeXt" },
    { "name": "docbook", "extension": ".xml", "friendly_name": "DocBook" },
    { "name": "docbook4", "extension": ".xml", "friendly_name": "DocBook 4" },
    { "name": "docbook5", "extension": ".xml", "friendly_name": "DocBook 5" },
    { "name": "docx", "extension": ".docx", "friendly_name": "Microsoft Word" },
    { "name": "dokuwiki", "extension": ".txt", "friendly_name": "DokuWiki" },
    { "name": "dzslides", "extension": ".html", "friendly_name": "DZSlides" },
    { "name": "epub", "extension": ".epub", "friendly_name": "EPUB" },
    { "name": "epub2", "extension": ".epub", "friendly_name": "EPUB 2" },
    { "name": "epub3", "extension": ".epub", "friendly_name": "EPUB 3" },
    { "name": "fb2", "extension": ".fb2", "friendly_name": "FictionBook 2" },
    { "name": "gfm", "extension": ".md", "friendly_name": "GitHub Flavored Markdown" },
    { "name": "haddock", "extension": ".hs", "friendly_name": "Haddock" },
    { "name": "html", "extension": ".html", "friendly_name": "HTML" },
    { "name": "html4", "extension": ".html", "friendly_name": "HTML 4" },
    { "name": "html5", "extension": ".html", "friendly_name": "HTML 5" },
    { "name": "icml", "extension": ".icml", "friendly_name": "InDesign ICML" },
    { "name": "ipynb", "extension": ".ipynb", "friendly_name": "Jupyter Notebook" },
    { "name": "jats", "extension": ".xml", "friendly_name": "JATS" },
    { "name": "jats_archiving", "extension": ".xml", "friendly_name": "JATS Archiving" },
    { "name": "jats_articleauthoring", "extension": ".xml", "friendly_name": "JATS Article Authoring" },
    { "name": "jats_publishing", "extension": ".xml", "friendly_name": "JATS Publishing" },
    { "name": "jira", "extension": ".txt", "friendly_name": "JIRA" },
    { "name": "json", "extension": ".json", "friendly_name": "JSON" },
    { "name": "latex", "extension": ".tex", "friendly_name": "LaTeX" },
    { "name": "man", "extension": ".1", "friendly_name": "Man Page" },
    { "name": "markdown", "extension": ".md", "friendly_name": "Markdown" },
    { "name": "markdown_github", "extension": ".md", "friendly_name": "GitHub Markdown" },
    { "name": "markdown_mmd", "extension": ".md", "friendly_name": "MultiMarkdown" },
    { "name": "markdown_phpextra", "extension": ".md", "friendly_name": "PHP Markdown Extra" },
    { "name": "markdown_strict", "extension": ".md", "friendly_name": "Strict Markdown" },
    { "name": "mediawiki", "extension": ".txt", "friendly_name": "MediaWiki" },
    { "name": "ms", "extension": ".ms", "friendly_name": "MS (groff)" },
    { "name": "muse", "extension": ".muse", "friendly_name": "Muse" },
    { "name": "native", "extension": ".txt", "friendly_name": "Pandoc Native" },
    { "name": "odt", "extension": ".odt", "friendly_name": "OpenDocument" },
    { "name": "opendocument", "extension": ".odt", "friendly_name": "OpenDocument" },
    { "name": "opml", "extension": ".opml", "friendly_name": "OPML" },
    { "name": "org", "extension": ".org", "friendly_name": "Org Mode" },
    { "name": "pdf", "extension": ".pdf", "friendly_name": "PDF" },
    { "name": "plain", "extension": ".txt", "friendly_name": "Plain Text" },
    { "name": "pptx", "extension": ".pptx", "friendly_name": "PowerPoint" },
    { "name": "revealjs", "extension": ".html", "friendly_name": "Reveal.js" },
    { "name": "rst", "extension": ".rst", "friendly_name": "reStructuredText" },
    { "name": "rtf", "extension": ".rtf", "friendly_name": "Rich Text Format" },
    { "name": "s5", "extension": ".html", "friendly_name": "S5" },
    { "name": "slideous", "extension": ".html", "friendly_name": "Slideous" },
    { "name": "slidy", "extension": ".html", "friendly_name": "Slidy" },
    { "name": "tei", "extension": ".xml", "friendly_name": "TEI" },
    { "name": "texinfo", "extension": ".tex", "friendly_name": "Texinfo" },
    { "name": "textile", "extension": ".textile", "friendly_name": "Textile" },
    { "name": "xwiki", "extension": ".xwiki", "friendly_name": "XWiki" },
    { "name": "zimwiki", "extension": ".zim", "friendly_name": "ZimWiki" }
];

const base64ToBlob = (base64, type = 'application/octet-stream') => {
    const binary = atob(base64.replace(/\s/g, ''));
    const len = binary.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
    }
    return new Blob([view], { type });
};

const generateFileName = (output_format) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const extension = output_formats.find(format => format.name === output_format)?.extension || "pdf";
    console.log(
        {
            extension,
            output_format
        }
    );

    return `pandoc_${year}/${month}/${day}_${hours}:${minutes}:${seconds}.${extension}`;
};

const defaultInputFormat = "markdown";
const defaultOutputFormat = "pdf";

const Pandoc = () => {
    const confettiRef = useRef(null);

    const [text, setText] = useState(mkdStr);
    const { address } = useAccount();
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("pandoc.pdf");
    const [loading, setLoading] = useState(false);
    const [input_format, setInputFormat] = useState(defaultInputFormat);
    const [output_format, setOutputFormat] = useState(defaultOutputFormat);

    const handleConvert = async () => {
        setLoading(true);
        try {
            const request = await hypercycle.aimFetch(
                address,
                nodeUrl,
                aimSlot,
                "POST",
                "/convert",
                {},
                JSON.stringify({
                    text,
                    input_format,
                    output_format
                }),
                {},
                "ethereum"
            );
            // "output": {"file": "<File:Base64>"},
            const data = await request.json();
            console.log({ data });

            const fileBase64 = data.file;
            const blob = base64ToBlob(fileBase64, 'application/pdf');
            const url = URL.createObjectURL(blob);
            setFile(url);
            setFileName(generateFileName(output_format));
            launchConfetti();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const fetchOptions = useCallback(async () => {
        try {
            const request = await hypercycle.aimFetch(
                address,
                nodeUrl,
                aimSlot,
                "OPTIONS",
                "/convert",
                {},
                {},
                {},
                "ethereum"
            );
            const data = await request.json();
            console.log({ data });
        } catch (error) {
            console.log(error);
        }
    }, [address]);

    const launchConfetti = () => {
        confettiRef.current.addConfetti({
            emojis: ["✅", "📂"],
            confettiRadius: 2,
            confettiNumber: 5,
        });
    };

    useEffect(() => {
        confettiRef.current = new JSConfetti();
    }, []);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions])

    return (
        <main className="w-full flex flex-col justify-between sm:p-8 p-2">
            <h1 className="italic pb-8">Pandoc</h1>
            <div className="flex flex-col sm:flex-row gap-4">
                <MDEditor className={`transition-all duration-500 w-full ${file ? 'sm:w-1/2' : 'w-full'}`} height={380} value={text} onChange={setText} />
                {file && (
                    <iframe
                        className={`transition-all rounded duration-500 w-full ${file ? 'sm:w-1/2' : 'w-0'}`}
                        src={file}
                        title="PDF Preview"
                    ></iframe>
                )}
            </div>
            <div className="grid grid-rows-3 sm:grid-rows-1 sm:grid-cols-4 items-center py-4 px-2 sm:px-8 gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center sm:col-span-2 justify-self-end gap-2 sm:gap-0 mt-6">
                    <div className="flex w-full">
                        <sup className="text-xs text-gray-400 min-w-[25px] sm:min-w-auto">
                            from
                        </sup>
                        <select
                            className="min-w-20 w-full sm:w-auto border-b appearance-none p-1 cursor-pointer"
                            name="from"
                            id="from"
                            title="Select input format"
                            value={input_format}
                            onChange={(e) => setInputFormat(e.target.value)}
                        >
                            {input_formats.map((format, index) => (
                                <option key={index} value={format}>{format}</option>
                            ))}
                        </select>
                    </div>
                    <ArrowBigRightDash className="w-8 h-8 mx-4 hidden sm:block text-white" />
                    <ArrowBigDownDash className="w-8 h-8 mx-4 mt-4 block sm:hidden text-white" />
                    <div className="flex w-full">
                        <sup className="text-xs text-gray-400 min-w-[25px] sm:min-w-auto">
                            to
                        </sup>
                        <select
                            className="min-w-20 w-full sm:w-auto border-b appearance-none p-1 cursor-pointer"
                            name="to"
                            id="to"
                            title="Select output format"
                            value={output_format}
                            onChange={(e) => setOutputFormat(e.target.value)}
                        >
                            {output_formats.map((format, index) => (
                                <option key={index} value={format.name}>{format.friendly_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <ConnectKitButton.Custom>
                    {({ show }) => {
                        return (
                            <button
                                className="bg-blue-500 text-white hover:bg-blue-700 disabled:!bg-gray-400 disabled:!cursor-not-allowed font-bold py-2 px-4 rounded"
                                onClick={() => {
                                    if (loading) return;
                                    if (!address) {
                                        show();
                                    } else {
                                        handleConvert();
                                    }
                                }}
                            >
                                {loading ? <span className="animate-pulse">Converting...</span> : "Convert"}
                            </button>
                        );
                    }}
                </ConnectKitButton.Custom>
                <div className={`${file ? "block" : "invisible"} w-fit flex gap-2 ml-auto row-start-1 sm:row-start-auto`}>
                    <ClipboardX
                        className="w-6 h-6 mx-4 text-white"
                        title="Discard"
                        onClick={() => {
                            setFile(null);
                            setFileName("pandoc.pdf");
                        }}
                    />
                    <a href={file} download={fileName}>
                        <Download className="w-6 h-6 text-white cursor-pointer" />
                    </a>
                </div>
            </div>
        </main >

    )
}

export { Pandoc }
