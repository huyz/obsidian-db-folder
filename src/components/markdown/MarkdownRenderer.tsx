import { NormalizedPath } from "cdm/FolderModel";
import { DatabaseView } from "DatabaseView";
import { MediaExtensions } from "helpers/Constants";
import { getNormalizedPath } from "helpers/VaultManagement";
import { MarkdownRenderer, TFile } from "obsidian";
import { LOGGER } from "services/Logger";

export async function renderMarkdown(
  view: DatabaseView,
  markdownString: string,
  domElement: HTMLDivElement
): Promise<HTMLDivElement> {
  try {
    if (isValidHttpUrl(markdownString, view)) {
      const { height, width } = view.diskConfig.yaml.config.media_settings;
      // TODO option to generate Iframes
      //markdownString = `<div class=iframe-container> <iframe width="427" height="240" src="${markdownString}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> </div>`;
      markdownString = `![embedded link|${height}x${width}](${markdownString})`;
    }

    await MarkdownRenderer.renderMarkdown(
      markdownString,
      domElement,
      view.file.path,
      view
    );

    await handleEmbeds(domElement, view, 5);
    // applyCheckboxIndexes(dom);
    // findUnresolvedLinks(dom, view);
  } catch (e) {
    LOGGER.error(e);
  }

  return domElement;
}

function handleEmbeds(dom: HTMLDivElement, view: DatabaseView, depth: number) {
  return Promise.all(
    dom.findAll(".internal-embed").map(async (el) => {
      const src = el.getAttribute("src");
      const normalizedPath = getNormalizedPath(src);
      const target =
        typeof src === "string" &&
        view.app.metadataCache.getFirstLinkpathDest(
          normalizedPath.root,
          view.file.path
        );

      if (!(target instanceof TFile)) {
        return;
      }

      if (MediaExtensions.IMAGE.contains(target.extension)) {
        return handleImage(el, target, view);
      }

      if (MediaExtensions.AUDIO.contains(target.extension)) {
        return handleAudio(el, target, view);
      }

      if (MediaExtensions.VIDEO.contains(target.extension)) {
        return handleVideo(el, target, view);
      }

      //   if (target.extension === "md") {
      //     return await handleMarkdown(el, target, normalizedPath, view, depth);
      //   }

      //return handleUnknownFile(el, target);
    })
  );
}

function handleImage(el: HTMLElement, file: TFile, view: DatabaseView) {
  el.empty();

  el.createEl(
    "img",
    { attr: { src: view.app.vault.getResourcePath(file) } },
    (img) => {
      if (el.hasAttribute("width")) {
        img.setAttribute("width", el.getAttribute("width"));
      }

      if (el.hasAttribute("height")) {
        img.setAttribute("height", el.getAttribute("height"));
      }

      if (el.hasAttribute("alt")) {
        img.setAttribute("alt", el.getAttribute("alt"));
      }
    }
  );

  el.addClasses(["image-embed", "is-loaded"]);
}

function handleAudio(el: HTMLElement, file: TFile, view: DatabaseView) {
  el.empty();
  el.createEl("audio", {
    attr: { controls: "", src: view.app.vault.getResourcePath(file) },
  });
  el.addClasses(["media-embed", "is-loaded"]);
}

function handleVideo(el: HTMLElement, file: TFile, view: DatabaseView) {
  el.empty();

  el.createEl(
    "video",
    { attr: { controls: "", src: view.app.vault.getResourcePath(file) } },
    (video) => {
      const handleLoad = () => {
        video.removeEventListener("loadedmetadata", handleLoad);

        if (video.videoWidth === 0 && video.videoHeight === 0) {
          el.empty();
          handleAudio(el, file, view);
        }
      };

      video.addEventListener("loadedmetadata", handleLoad);
    }
  );

  el.addClasses(["media-embed", "is-loaded"]);
}

function isValidHttpUrl(urlCandidate: string, view: DatabaseView) {
  let url;

  try {
    url = new URL(urlCandidate);
  } catch (_) {
    return false;
  }

  return (
    (url.protocol === "http:" || url.protocol === "https:") &&
    view.diskConfig.yaml.config.media_settings.enable_media_view
  );
}