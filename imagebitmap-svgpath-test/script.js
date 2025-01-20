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
 * テスト関数
================================================================================================= */

/** @type {(size: number, count: number, repeat: number) => {bitmaps: ImageBitmap[], pathList: {fillStyle: string, path: string}[][]}} - テストデータの生成 */
const generateTestData = (size, count, repeat) => {
    const bitmaps = [];
    const pathList = [];
    // 実行回数分繰り返す
    for (let repeat_index = 0; repeat_index < repeat; repeat_index++) {
        // ImageBitmapを生成するためのOffscreenCanvasを作成する
        const canvas = new OffscreenCanvas(size, size);
        const ctx = canvas.getContext("2d");
        const paths = [];
        // 図形の数分繰り返す
        for (let count_index = 0; count_index < count; count_index++) {
            // ランダムに0x000000以上0xFFFFFF以下の整数を4つ生成して、それを16進数の文字列に変換してカラーコードにする
            const color = "#" + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, "0");
            // ランダムに0以上size以下の数値を6つ生成して、それをSVGのパスに変換する
            const positions = new Array(6).fill(0).map(() => (Math.random() * size).toFixed(4));
            const path = `M${positions[0]},${positions[1]} L${positions[2]},${positions[3]} L${positions[4]},${positions[5]} Z`;
            // pathsに追加する
            paths.push({
                "fillStyle": color,
                "path": path,
            });
            // OffscreenCanvasに描画する
            ctx.fillStyle = color;
            ctx.fill(new Path2D(path));
        }
        // OffscreenCanvasからImageBitmapを生成してbitmapsに追加する
        bitmaps.push(canvas.transferToImageBitmap());
        // pathsをpathListに追加する
        pathList.push(paths);
    }
    return { bitmaps, pathList };
};

/** @type {() => void} - テストを一通り実行する関数 */
const run = () => {
    // 設定値の取得
    const size = Number($("#size").value);
    const count = Number($("#count").value);
    const repeat = Number($("#repeat").value);
    // canvasのサイズを設定する
    $("#canvas1").width = size;
    $("#canvas1").height = size;
    $("#canvas2").width = size;
    $("#canvas2").height = size;
    // テストデータの生成
    const { bitmaps, pathList } = generateTestData(size, count, repeat);
    // テストデータの表示
    console.log("bitmaps", bitmaps);
    console.log("pathList", pathList);
    /** テスト(1) : ImageBitmapを描画する(#canvas1に) */
    const canvas1 = $("#canvas1");
    const ctx1 = canvas1.getContext("2d");
    const test1_startAt = performance.now();
    for (let i = 0; i < repeat; i++) {
        // 削除
        ctx1.clearRect(0, 0, size, size);
        // 描画
        ctx1.drawImage(bitmaps[i], 0, 0);
    }
    const test1_endAt = performance.now();
    /** テスト(2) : "SVG PathとfillStyleを読んでPath2Dを生成する"を都度やる(#canvas2に) */
    const canvas2 = $("#canvas2");
    const ctx2 = canvas2.getContext("2d");
    const test2_startAt = performance.now();
    for (let i = 0; i < repeat; i++) {
        // 削除
        ctx2.clearRect(0, 0, size, size);
        // 描画
        for (const { fillStyle, path } of pathList[i]) {
            ctx2.fillStyle = fillStyle;
            ctx2.fill(new Path2D(path));
        }
    }
    const test2_endAt = performance.now();
    /** 結果の出力(.resultsの中のtableに) */
    // ImageBitmap 合計処理時間
    $("#time1").textContent = `${(test1_endAt - test1_startAt).toFixed(3)}ms`;
    // "SVG PathとfillStyleを読んでPath2Dを生成する" 合計処理時間
    $("#time2").textContent = `${(test2_endAt - test2_startAt).toFixed(3)}ms`;
    // ImageBitmap 1回あたりの処理時間
    $("#average1").textContent = `${((test1_endAt - test1_startAt) / repeat).toFixed(3)}ms`;
    // "SVG PathとfillStyleを読んでPath2Dを生成する" 1回あたりの処理時間
    $("#average2").textContent = `${((test2_endAt - test2_startAt) / repeat).toFixed(3)}ms`;
    console.log(performance.memory);
};

/** ================================================================================================
 * イベントリスナー
================================================================================================= */
$("button#start").addEventListener("click", run);
