//这里我们认为是没有padding，需要外部加上margin或者套一层即可，暂时忽略
export default class WaterFallModel {
    totalWidth: number;
    itemWidth: number = 0;
    maxItemWidth: number;
    gap: number;
    columns: number;
    columnsHeight: number[];

    //计算规则
    //整体布局总宽度是必须要有的
    //如果设置了单个itemWidth宽度，则会根据gap(默认为10)，计算页面布局，放置不开则右侧留白
    //如果没有设置itemWith，这里直接建议同时设置 maxItemWidth，则会有限根据最大 ItemWidth 伸开，如果最后一个超出整体宽度，则适当缩小，保证最后一个贴边，不留白
    //有最大这里不要最小了，简化一点逻辑，另外设置最大就足够了(对于图片体验稍好)，最小没啥必要
    //gap间距，默认设置为 10，可以设置，间距固定显示
    constructor(totalWidth: number) {
        this.totalWidth = totalWidth;
        this.itemWidth = totalWidth; //设置跟外部一样，默认一列，需要自己手动设置，计算后，此值会有所改变
        this.maxItemWidth = 0;
        this.gap = 10;
        this.columns = 0;
        this.columnsHeight = [];
    }

    generateColumns() {
        if (!this.totalWidth) {
            throw new Error("列数为0");
        }
        if (
            (!this.itemWidth || this.itemWidth <= 0) &&
            !(this.maxItemWidth || this.maxItemWidth <= 0)
        ) {
            throw new Error("列数为0");
        }
        let columns = 0;
        if (this.maxItemWidth) {
            columns =
                Math.ceil((this.totalWidth + this.gap) /
                (this.maxItemWidth + this.gap));
            //根据计算出的列数，计算出实际的 ItemWidth，结果取地板，毕竟像素不存在小数，整体可以少个一个半个像素的，但是越界可能会导致渲染出现问题
            this.itemWidth = Math.floor(
                (this.totalWidth + this.gap) / (columns)
            ) - this.gap;
            console.log("maxItemWidth", columns);
        } else if (this.itemWidth) {
            //查找一共有几列中间有 this.gap，为了最后一个贴边，总体要加上一个gap，取地板即可
            columns =
                Math.floor((this.totalWidth + this.gap) /
                (this.itemWidth + this.gap));
            console.log("itemWidth", columns);
        }
        console.log('columns', columns, 'totalwidth', this.totalWidth, 'itemwidth', this.itemWidth)
        this.columns = columns;
        this.columnsHeight = new Array(this.columns).fill(0);
    }

    //传入宽高比 radio = width / height，给出应当插入的列
    waterFallAtIndex(radio: number) {
        if (!this.columns || this.columns === 1) return 0;
        const height = this.itemWidth / radio;
        let minIdx = 0;
        this.columnsHeight.reduce((pre, cur, idx) => {
            if (cur < pre) {
                minIdx = idx;
                return cur;
            }
            return pre;
        }, this.columnsHeight[0]);
        this.columnsHeight[minIdx] += height;
        return minIdx;
    }
}
