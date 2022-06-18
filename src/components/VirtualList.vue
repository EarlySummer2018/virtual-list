<script setup lang="ts">
import { ref, onMounted, computed, CSSProperties, StyleValue } from "vue";
import axios from "axios";
interface List {
  id: string;
  title: string;
  img: string;
  desc?: string;
}
// 数据列表
const dataList = ref<Array<List>>([]);
// 获取数据列表
const getDataList = async (isPagination: boolean = false): Promise<void> => {
  try {
    if (isRequetsStatus.value) return;
    isRequetsStatus.value = true;
    const res = await axios.get("/api/list");

    if (res.data.code !== 200) return;

    isPagination &&
      (dataList.value = [...dataList.value, ...res.data.data.list]);
    !isPagination && (dataList.value = res.data.data.list);
  } catch (error) {
    console.log(error);
  } finally {
    isRequetsStatus.value = false;
  }
};

// 每一条的高度
const oneHeight = ref<number>(90);
// 容器
const listContainter = ref<HTMLElement | null>(null);
// 容量
const maximumCapacity = ref<number>(0);
// 获取可视区域最大容量
const getMaximumCapacity = (): void => {
  // 容器高度 / 每一条的高度，等于一屏可以容纳总条数，由于屏幕顶部和底部滑动时会出现半条的情况，所有需要再加两条以免出现空白
  maximumCapacity.value =
    ~~(listContainter.value!.offsetHeight / oneHeight.value) + 2;
};

// 第一屏第一条索引
const oneIndex = ref<number>(0);

// 第三屏最后一条索引，因为最后一条索引是根据 oneIndex 进行获取的，所以使用 computed 属性
const endIndex = computed((): number => {
  let index = (oneIndex.value + maximumCapacity.value) * 2;
  !dataList.value[index] && (index = dataList.value.length - 1);
  return index;
});

// 根据屏幕滚动获取渲染数组
const getRenderArray = computed((): Array<List> => {
  // 为确保低性能设备不出现明显的白屏，所以需要渲染上中下三屏数据
  let startIndex = 0;
  if (oneIndex.value <= maximumCapacity.value) startIndex = 0;
  else startIndex = oneIndex.value - maximumCapacity.value;
  return dataList.value.slice(startIndex, endIndex.value);
});

// 请求时显示的文本
const loadingText = ref<string>("拼命加载中...");

// 用于判断当前是否正在请求、节流
const isRequetsStatus = ref<boolean>(false);

// 计算上下空白区域
const blankStyle = computed((): StyleValue => {
  let startIndex = 0;
  if (oneIndex.value <= maximumCapacity.value) startIndex = 0;
  else startIndex = oneIndex.value - maximumCapacity.value;
  return {
    paddingTop: startIndex * oneHeight.value + "px",
    // paddingBottom:
    //   (dataList.value.length - endIndex.value) * oneHeight.value + "px",
    height: dataList.value.length * oneHeight.value + "px",
  };
});

// 屏幕滚动事件
const handleScroll = (): void => {
  const animationFrame = window.requestAnimationFrame;
  const fps = 30;
  const interval = 1000 / fps;
  let timeNow = Date.now();
  function animation() {
    const now = Date.now();

    handleScrollEvent();
    if (now - timeNow >= interval) {
      timeNow = now;
      animationFrame(animation);
    }
  }
  animationFrame(animation);
};

// 屏幕滚动时要处理逻辑的事件
const handleScrollEvent = () => {
  const currentIndex = ~~(listContainter.value!.scrollTop / oneHeight.value);
  if (oneIndex.value === currentIndex) return;
  oneIndex.value = currentIndex;
  // 判断是否触底

  if (
    oneIndex.value + maximumCapacity.value > dataList.value.length - 1 &&
    !isRequetsStatus.value
  ) {
    // getDataList(true);
  }
};

// 请求数据
getDataList();

// 返回顶部
const toTop = () => {
  listContainter.value!.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
// 数据渲染完成之后获取最大容积
onMounted(() => {
  getMaximumCapacity();
  addEventListener("resize", getMaximumCapacity, false);
});
</script>

<template>
  <header id="header" @click="toTop()">返回顶部</header>
  <section class="list-box">
    <div class="list" ref="listContainter" @scroll.passive="handleScroll">
      <div :style="blankStyle">
        <div
          class="list-item"
          :data-id="item.id"
          v-for="(item, index) in getRenderArray"
          :key="item.id"
        >
          <h3 class="h3">{{ item.title }}</h3>
          <img class="img" src="../assets/img.png" alt="图片" />
        </div>
        <p v-if="isRequetsStatus">{{ loadingText }}</p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
#header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 30px;
  margin-bottom: 10px;
  background-color: pink;
}
.list-box {
  width: 100%;
  // padding: 0 10px;
  height: calc(100% - 40px);
  overflow: hidden;
  .list {
    overflow-y: auto;
    height: 100%;
    transition: all 1s ease;
    .list-item {
      display: flex;
      height: 90px;
      padding-bottom: 10px;
      margin-bottom: 10px;
      border-bottom: 1px solid #ccc;
      align-items: center;
      justify-content: space-between;
      .h3 {
        flex: 1;
        font-size: 16px;
        font-weight: 400;
        text-align: justify;
        text-indent: 32px;
      }
      .img {
        display: inline-block;
        width: 100px;
        height: 80px;
        margin-left: 20px;
        vertical-align: top;
      }
    }
  }
}
</style>
