import DOMPurify from 'dompurify';

import {
  IMAGE_DATA_TYPE,
  imageBlockConfig,
  imageBlockSchema,
  remarkImageBlockPlugin
} from '@milkdown/components/image-block';
import { $view } from '@milkdown/utils';

import {
  applyPresetImageRatio,
  clampImageRatio,
  computeFittedImageDimensions,
  computeResizeRatioFromCornerDrag,
  resolveImageContainerWidth
} from './image-block-sizing.js';

const IMAGE_PRESET_BUTTONS = [
  { key: 'small', label: '小' },
  { key: 'medium', label: '中' },
  { key: 'large', label: '大' },
  { key: 'fit', label: '适配' }
];
const IMAGE_RESIZE_CORNERS = ['nw', 'ne', 'sw', 'se'];

function setSanitizedMarkup(node, markup) {
  if (!(node instanceof HTMLElement)) {
    return;
  }

  node.innerHTML = markup ? DOMPurify.sanitize(String(markup).trim()) : '';
}

function createButton({ className = '', text = '', title = '', onClick = null } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  if (className) {
    button.className = className;
  }
  if (text) {
    button.textContent = text;
  }
  if (title) {
    button.title = title;
    button.setAttribute('aria-label', title);
  }
  if (typeof onClick === 'function') {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick(event);
    });
  }
  button.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
  return button;
}

function preventDragStart(node) {
  node?.addEventListener('dragstart', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
}

class EnhancedImageBlockController {
  constructor(ctx, view, getPos, initialNode) {
    this.ctx = ctx;
    this.view = view;
    this.getPos = getPos;
    this.config = ctx.get(imageBlockConfig.key);
    this.dom = document.createElement('div');
    this.dom.className = 'milkdown-image-block';
    this.state = {
      src: '',
      caption: '',
      ratio: 1,
      selected: false,
      readonly: !view.editable,
      showCaption: false,
      linkDraft: ''
    };
    this.imageElement = null;
    this.toolbarElement = null;
    this.captionToggleButton = null;
    this.captionInput = null;
    this.emptyLinkInput = null;
    this.activeResize = null;
    this.proxyRequestId = 0;

    this.bindAttrs(initialNode);
  }

  setAttr(attr, value) {
    if (!this.view.editable) {
      return;
    }

    const pos = this.getPos();
    if (pos == null) {
      return;
    }

    this.view.dispatch(
      this.view.state.tr.setNodeAttribute(
        pos,
        attr,
        attr === 'src' ? DOMPurify.sanitize(String(value ?? '')) : value
      )
    );
  }

  setSelected(selected) {
    this.state.selected = selected;
    this.dom.classList.toggle('selected', selected);
  }

  bindAttrs(node) {
    const hadSrc = Boolean(this.state.src);
    this.state.caption = node.attrs.caption ?? '';
    this.state.ratio = clampImageRatio(node.attrs.ratio ?? 1);
    this.state.readonly = !this.view.editable;
    if (this.state.caption) {
      this.state.showCaption = true;
    }

    const nextSrc = node.attrs.src ?? '';
    if (!nextSrc) {
      this.state.src = '';
      this.state.linkDraft = '';
      if (hadSrc || !this.dom.childElementCount) {
        this.render();
      } else {
        this.updateEmptyState();
      }
      return;
    }

    const proxyDomURL = this.config.proxyDomURL;
    if (!proxyDomURL) {
      this.state.src = nextSrc;
      if (!hadSrc || !this.imageElement) {
        this.render();
      } else {
        this.updateFilledImageState();
      }
      return;
    }

    const requestId = ++this.proxyRequestId;
    const proxiedURL = proxyDomURL(nextSrc);
    if (typeof proxiedURL === 'string') {
      this.state.src = proxiedURL;
      if (!hadSrc || !this.imageElement) {
        this.render();
      } else {
        this.updateFilledImageState();
      }
      return;
    }

    Promise.resolve(proxiedURL)
      .then((url) => {
        if (requestId !== this.proxyRequestId) {
          return;
        }
        this.state.src = url;
        if (!hadSrc || !this.imageElement) {
          this.render();
        } else {
          this.updateFilledImageState();
        }
      })
      .catch(() => {
        if (requestId !== this.proxyRequestId) {
          return;
        }
        this.state.src = nextSrc;
        if (!hadSrc || !this.imageElement) {
          this.render();
        } else {
          this.updateFilledImageState();
        }
      });
  }

  getContainerWidth() {
    const blockWidth = Math.round(this.dom.getBoundingClientRect().width);
    const parentWidth = Math.round(this.dom.parentElement?.clientWidth ?? this.dom.parentElement?.getBoundingClientRect().width ?? 0);
    const editorWidth = Math.round(this.dom.closest('.ProseMirror')?.clientWidth ?? 0);

    return resolveImageContainerWidth({
      blockWidth,
      parentWidth,
      editorWidth,
      fallbackWidth: this.config.maxWidth ?? 0
    });
  }

  getImageLayout(ratio = this.state.ratio) {
    const image = this.imageElement;
    if (!(image instanceof HTMLImageElement) || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      return null;
    }

    const baselineLayout = computeFittedImageDimensions({
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      containerWidth: this.getContainerWidth(),
      ratio: 1,
      maxWidth: this.config.maxWidth
    });

    return computeFittedImageDimensions({
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      containerWidth: this.getContainerWidth(),
      ratio,
      maxWidth: this.config.maxWidth,
      maxRatio: baselineLayout.maxRatio
    });
  }

  applyImageLayout(ratio = this.state.ratio) {
    const image = this.imageElement;
    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    const layout = this.getImageLayout(ratio);
    if (!layout) {
      return;
    }

    image.dataset.originWidth = String(layout.baselineWidth);
    image.dataset.originHeight = String(layout.baselineHeight);
    image.dataset.currentRatio = String(layout.ratio);
    image.dataset.maxRatio = String(layout.maxRatio);
    image.style.width = `${layout.width}px`;
    image.style.height = `${layout.height}px`;
    image.style.maxWidth = '100%';
  }

  handlePresetRatio(presetKey) {
    const layout = this.getImageLayout(1);
    if (!layout) {
      return;
    }

    const nextRatio = clampImageRatio(applyPresetImageRatio(presetKey), { max: layout.maxRatio });
    this.state.ratio = nextRatio;
    this.applyImageLayout(nextRatio);
    this.setAttr('ratio', nextRatio);
  }

  startCornerResize(event, corner) {
    if (this.state.readonly || !(this.imageElement instanceof HTMLImageElement)) {
      return;
    }

    const layout = this.getImageLayout();
    if (!layout) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.activeResize = {
      corner,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: layout.width,
      startHeight: layout.height,
      maxRatio: layout.maxRatio
    };
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerMove = (event) => {
    if (!this.activeResize) {
      return;
    }

    const nextRatio = clampImageRatio(
      computeResizeRatioFromCornerDrag({
        startWidth: this.activeResize.startWidth,
        startHeight: this.activeResize.startHeight,
        dx: event.clientX - this.activeResize.startX,
        dy: event.clientY - this.activeResize.startY,
        corner: this.activeResize.corner
      }),
      { max: this.activeResize.maxRatio }
    );

    this.state.ratio = nextRatio;
    this.applyImageLayout(nextRatio);
  };

  onPointerUp = () => {
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);

    if (!this.activeResize) {
      return;
    }

    this.setAttr('ratio', this.state.ratio);
    this.activeResize = null;
  };

  toggleCaption() {
    this.state.showCaption = !this.state.showCaption;
    this.updateCaptionVisibility();
  }

  updateEmptyState() {
    if (this.emptyLinkInput instanceof HTMLInputElement) {
      this.emptyLinkInput.value = this.state.linkDraft;
      this.emptyLinkInput.disabled = this.state.readonly;
    }
  }

  updateToolbarState() {
    if (!(this.toolbarElement instanceof HTMLElement)) {
      return;
    }

    this.toolbarElement.querySelectorAll('.image-preset-button').forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }
      const { preset } = button.dataset;
      const active = preset && Math.abs(this.state.ratio - applyPresetImageRatio(preset)) < 0.02;
      if (active) {
        button.dataset.active = 'true';
      } else {
        delete button.dataset.active;
      }
    });

    if (this.captionToggleButton instanceof HTMLButtonElement) {
      this.captionToggleButton.textContent = this.state.showCaption ? '隐藏说明' : '添加说明';
    }
  }

  updateCaptionVisibility() {
    this.updateToolbarState();
    if (!this.state.src) {
      return;
    }

    if (this.state.showCaption) {
      if (!(this.captionInput instanceof HTMLInputElement)) {
        const captionInput = document.createElement('input');
        captionInput.className = 'caption-input';
        captionInput.placeholder = this.config.captionPlaceholderText ?? '图片说明';
        preventDragStart(captionInput);
        captionInput.addEventListener('input', (event) => {
          this.state.caption = event.target instanceof HTMLInputElement ? event.target.value : '';
        });
        captionInput.addEventListener('blur', (event) => {
          const nextValue = event.target instanceof HTMLInputElement ? event.target.value : '';
          this.state.caption = nextValue;
          this.setAttr('caption', nextValue);
        });
        this.captionInput = captionInput;
      }
      this.captionInput.value = this.state.caption;
      if (this.captionInput.parentElement !== this.dom) {
        this.dom.appendChild(this.captionInput);
      }
      return;
    }

    this.captionInput?.remove();
  }

  updateFilledImageState() {
    if (!(this.imageElement instanceof HTMLImageElement)) {
      return;
    }

    if (this.imageElement.src !== this.state.src) {
      this.imageElement.src = this.state.src;
    }
    this.imageElement.alt = this.state.caption;
    this.applyImageLayout();
    this.updateCaptionVisibility();
  }

  renderEmptyState() {
    const panel = document.createElement('div');
    panel.className = 'image-edit';

    const icon = document.createElement('span');
    icon.className = 'image-icon';
    setSanitizedMarkup(icon, this.config.imageIcon);

    const importer = document.createElement('div');
    importer.className = 'link-importer';

    const input = document.createElement('input');
    input.className = 'link-input-area';
    input.disabled = this.state.readonly;
    input.placeholder = '粘贴图片链接';
    input.value = this.state.linkDraft;
    this.emptyLinkInput = input;
    preventDragStart(input);
    input.addEventListener('input', (event) => {
      const value = event.target instanceof HTMLInputElement ? event.target.value : '';
      this.state.linkDraft = value;
    });
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') {
        return;
      }
      event.preventDefault();
      const value = input.value.trim();
      if (!value) {
        return;
      }
      this.setAttr('src', value);
    });

    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    const fileInput = document.createElement('input');
    const inputId = `image-upload-${Math.random().toString(36).slice(2, 9)}`;
    fileInput.id = inputId;
    fileInput.className = 'hidden';
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.disabled = this.state.readonly;
    fileInput.addEventListener('change', async (event) => {
      const target = event.target instanceof HTMLInputElement ? event.target : null;
      const file = target?.files?.[0];
      if (!file) {
        return;
      }

      const url = await this.config.onUpload(file);
      if (!url) {
        return;
      }

      this.setAttr('src', url);
    });

    const uploadButton = document.createElement('label');
    uploadButton.className = 'uploader';
    uploadButton.htmlFor = inputId;
    setSanitizedMarkup(uploadButton, this.config.uploadButton);

    const helperText = document.createElement('span');
    helperText.className = 'text';
    helperText.textContent = this.config.uploadPlaceholderText ?? '或选择本地图片';

    placeholder.append(fileInput, uploadButton, helperText);
    importer.append(input, placeholder);

    const confirm = createButton({
      className: 'confirm',
      title: '插入图片链接',
      onClick: () => {
        const value = input.value.trim();
        if (!value) {
          return;
        }
        this.setAttr('src', value);
      }
    });
    setSanitizedMarkup(confirm, this.config.confirmButton);
    confirm.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      event.preventDefault();
      const value = input.value.trim();
      if (!value) {
        return;
      }
      this.setAttr('src', value);
    });

    panel.append(icon, importer, confirm);
    this.dom.appendChild(panel);
  }

  renderFilledState() {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-wrapper';

    const toolbar = document.createElement('div');
    toolbar.className = 'image-toolbar';
    this.toolbarElement = toolbar;
    IMAGE_PRESET_BUTTONS.forEach(({ key, label }) => {
      const button = createButton({
        className: 'image-preset-button',
        text: label,
        title: `${label}尺寸`,
        onClick: () => this.handlePresetRatio(key)
      });
      button.dataset.preset = key;
      if (Math.abs(this.state.ratio - applyPresetImageRatio(key)) < 0.02) {
        button.dataset.active = 'true';
      }
      toolbar.appendChild(button);
    });
    this.captionToggleButton = createButton({
      className: 'image-toolbar-button',
      text: this.state.showCaption ? '隐藏说明' : '添加说明',
      title: '切换图片说明',
      onClick: () => this.toggleCaption()
    });
    toolbar.appendChild(this.captionToggleButton);

    const stage = document.createElement('div');
    stage.className = 'image-stage';

    const image = document.createElement('img');
    image.dataset.type = IMAGE_DATA_TYPE;
    image.src = this.state.src;
    image.alt = this.state.caption;
    image.addEventListener('load', () => this.applyImageLayout());
    image.addEventListener('error', (event) => {
      Promise.resolve(this.config.onImageLoadError?.(event)).catch(() => {});
    });
    this.imageElement = image;

    stage.appendChild(image);
    IMAGE_RESIZE_CORNERS.forEach((corner) => {
      const handle = createButton({
        className: 'milkdown-resize-handle image-resize-handle',
        title: '缩放图片'
      });
      handle.dataset.side = corner;
      handle.addEventListener('pointerdown', (event) => this.startCornerResize(event, corner));
      stage.appendChild(handle);
    });

    wrapper.append(toolbar, stage);
    this.dom.appendChild(wrapper);
    this.updateCaptionVisibility();
  }

  render() {
    this.dom.replaceChildren();
    this.dom.classList.toggle('selected', this.state.selected);
    this.dom.dataset.imageReady = this.state.src ? 'true' : 'false';

    if (!this.state.src) {
      this.imageElement = null;
      this.renderEmptyState();
      return;
    }

    this.renderFilledState();
  }

  stopEvent(event) {
    const target = event.target;
    return (
      target instanceof HTMLInputElement
      || target instanceof HTMLButtonElement
      || target instanceof HTMLLabelElement
      || target instanceof HTMLTextAreaElement
    );
  }

  destroy() {
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.activeResize = null;
    this.emptyLinkInput = null;
    this.captionInput = null;
    this.captionToggleButton = null;
    this.toolbarElement = null;
    this.imageElement = null;
    this.dom.remove();
  }
}

export const enhancedImageBlockView = $view(imageBlockSchema.node, (ctx) => {
  return (initialNode, view, getPos) => {
    const controller = new EnhancedImageBlockController(ctx, view, getPos, initialNode);

    return {
      dom: controller.dom,
      update: (updatedNode) => {
        if (updatedNode.type !== initialNode.type) {
          return false;
        }

        controller.bindAttrs(updatedNode);
        return true;
      },
      stopEvent: (event) => controller.stopEvent(event),
      selectNode: () => {
        controller.setSelected(true);
      },
      deselectNode: () => {
        controller.setSelected(false);
      },
      destroy: () => {
        controller.destroy();
      }
    };
  };
});

export const enhancedImageBlockComponent = [
  remarkImageBlockPlugin,
  imageBlockSchema,
  enhancedImageBlockView,
  imageBlockConfig
].flat();
