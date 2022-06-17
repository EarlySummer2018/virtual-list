<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import axios from "axios";
interface List {
  id: number;
  title: string;
  img: string;
  desc?: string;
}
const dataList = ref<List[]>([]);

// 加载提示
const loadingText = ref<string>("拼命加载中...");

// 每个 list-item 的高度
const listItemHieght = ref<number>(90);

// 当前可视区域内的第一条索引
const startIndex = ref<number>(0);

// 当前可视区域内的最后一条索引
// 计算 endIndex
const endIndex = computed((): number => {
  let endIndex: number = startIndex.value + containerSize.value * 2;
  if (!dataList.value[endIndex]) endIndex = dataList.value.length - 1;
  return endIndex;
});
// 当前请求状态，节流限制重复触底加载数据
const isRequetsStatus = ref<boolean>(false);

// 容器
const listContainter = ref<HTMLElement | null>(null);
// 容器容积
const containerSize = ref<number>(0);
// 获取容器最大容积
const getContainerSize = (): any => {
  containerSize.value =
    ~~(listContainter.value!.offsetHeight / listItemHieght.value) + 2;
};

// 计算渲染数组
const getRenderArray = computed((): List[] => {
  let start = 0;

  if (startIndex.value <= containerSize.value) start = 0;
  else start = startIndex.value - containerSize.value;
  console.log(dataList.value.slice(start, endIndex.value).length);

  return dataList.value.slice(start, endIndex.value);
});

// 获取数据
const getDataList = async () => {
  try {
    const res = await axios.get(`/api/list`);
    console.log(res);

    if (res.data.code === 200) dataList.value = res.data.data.list;
  } catch (error) {
    console.log(error);
  }
};

// 计算列表上下空白区域
const blankStyle = computed(() => {
  let start = 0;
  if (startIndex.value <= containerSize.value) start = 0;
  else start = startIndex.value - containerSize.value;
  return {
    paddingTop: start * listItemHieght.value + "px",
    paddingBottom:
      (dataList.value.length - endIndex.value) * listItemHieght.value + "px",
  };
});

// 获取数据
getDataList();
onMounted(() => {
  getContainerSize();
  // 监听窗口改变
  window.addEventListener("resize", getContainerSize, false);
});

// 处理滚动逻辑
const handleScroll = async (): Promise<void> => {
  let requestAnimationFrame = window.requestAnimationFrame;
  let fps: number = 30;
  let interval: number = 1000 / fps;
  let time: number = Date.now();
  function animation() {
    let now: number = Date.now();
    handleScrollEvent();
    if (now - time >= interval) {
      time = now;
      requestAnimationFrame(animation);
    }
  }
  requestAnimationFrame(animation);
};
// 滚动要执行的事件
const handleScrollEvent = async (): Promise<void> => {
  const currentIndex = ~~(
    listContainter.value!.scrollTop / listItemHieght.value
  );
  if (startIndex.value === currentIndex) return;
  startIndex.value = currentIndex;

  // 触底加载
  if (
    startIndex.value + containerSize.value > dataList.value.length - 1 &&
    !isRequetsStatus.value
  ) {
    try {
      isRequetsStatus.value = true;
      const newList = await axios.get(`/api/list`);
      if (newList.data.code === 200)
        dataList.value = [...dataList.value, ...newList.data.data.list];
    } catch (error) {
      console.log(error);
    } finally {
      isRequetsStatus.value = false;
    }
  }
};
</script>

<template>
  <header id="header">头部</header>
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
