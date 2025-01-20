/** ================================================================================================
 * テンプレート
================================================================================================= */

/**
 * ページのロード完了を待つ
 */
await Promise.race([
    // ページのロード完了を待つ
    new Promise((resolve) => { window.addEventListener("load", resolve, { once: true }); }),
    // document.readyStateがcompleteになるのを待つ(1秒ごとに確認)
    new Promise((resolve) => {
        const check = () => { if (document.readyState === "complete") { resolve(); } else { setTimeout(check, 1000); } };
        check();
    }),
]);

/**
 * document.querySelectorのエイリアス
 * @param {String} selector - CSSセレクタ
 * @returns {Element}
 */
const $ = selector => document.querySelector(selector);

/**
 * document.querySelectorAllのエイリアス
 * @param {String} selector - CSSセレクタ
 * @returns {Element[]}
 */
const $$ = selector => Array.from(document.querySelectorAll(selector));

/** ================================================================================================
 * 初期化 CanvasRenderingContext2D.globalCompositeOperationの取る値からそれに対応するCanvasを作成
================================================================================================= */

/** @type {string[]} globalCompositeOperationが取る値 */
const compositeOperations = [
    "source-over", "source-in", "source-out", "source-atop",
    "destination-over", "destination-in", "destination-out", "destination-atop",
    "lighter", "copy", "xor", "multiply", "screen", "overlay", "darken", "lighten",
    "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion",
    "hue", "saturation", "color", "luminosity",
];

/** @type {(option: string) => HTMLDivElement} 結果を表示するためのHTML要素 */
const getResultElement = (option) => {
    const div = document.createElement("div");
    const p = document.createElement("p");
    const canvas = document.createElement("canvas");
    canvas.id = `result-${option}`;
    div.appendChild(p);
    div.appendChild(canvas);
    p.textContent = option;
    canvas.width = 200;
    canvas.height = 200;
    return div;
};

compositeOperations.forEach(option => {
    const div = getResultElement(option);
    $("section.result").appendChild(div);
});

/** ================================================================================================
 * Canvasへの描画
================================================================================================= */

/** @type {() => void} Canvas要素の再描画 */
const redraw = () => {
    /** @description - #base-aを再描画 */
    const canvas_baseA = $("#base-a");
    const ctx_baseA = canvas_baseA.getContext("2d");
    /** @type {{fill: (string | undefined), stroke: (string | undefined), path: string}[]} */
    const paths_baseA = JSON.parse($("textarea#base-a-paths").value);
    ctx_baseA.clearRect(0, 0, canvas_baseA.width, canvas_baseA.height);
    console.log(paths_baseA);
    paths_baseA.forEach(({ fill, stroke, path }) => {
        const path2d = new Path2D();
        path2d.addPath(new Path2D(path), new DOMMatrix("scale(200, 200)"));
        if (fill) { ctx_baseA.fillStyle = fill; ctx_baseA.fill(path2d); }
        if (stroke) { ctx_baseA.strokeStyle = stroke; ctx_baseA.stroke(path2d); }
    });
    /** @description - #base-bを再描画 */
    const canvas_baseB = $("#base-b");
    const ctx_baseB = canvas_baseB.getContext("2d");
    /** @type {{fill: (string | undefined), stroke: (string | undefined), path: string}[]} */
    const paths_baseB = JSON.parse($("textarea#base-b-paths").value);
    ctx_baseB.clearRect(0, 0, canvas_baseB.width, canvas_baseB.height);
    paths_baseB.forEach(({ fill, stroke, path }) => {
        const path2d = new Path2D();
        path2d.addPath(new Path2D(path), new DOMMatrix("scale(200, 200)"));
        if (fill) { ctx_baseB.fillStyle = fill; ctx_baseB.fill(path2d); }
        if (stroke) { ctx_baseB.strokeStyle = stroke; ctx_baseB.stroke(path2d); }
    });
    /** @description - 結果を再描画 */
    compositeOperations.forEach(option => {
        const canvas_result = $(`#result-${option}`);
        const ctx_result = canvas_result.getContext("2d");
        ctx_result.clearRect(0, 0, canvas_result.width, canvas_result.height);
        ctx_result.globalCompositeOperation = option;
        ctx_result.drawImage(canvas_baseA, 0, 0);
        ctx_result.drawImage(canvas_baseB, 0, 0);
    });
};

redraw();
