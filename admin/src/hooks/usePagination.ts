import { ref, reactive, toRef, onMounted } from "vue";

export interface PaginationOptions<T, P extends Record<string, any>> {
  /**
   * 列表请求 API 函数
   */
  fetchApi: (params: P & { pageNum: number; pageSize: number }) => Promise<any>;
  /**
   * 初始业务查询过滤参数（不含 pageNum, pageSize）
   */
  defaultParams?: P;
  /**
   * 初始每页条数，默认为 10
   */
  defaultPageSize?: number;
  /**
   * 初始页码，默认为 1
   */
  defaultPageNum?: number;
  /**
   * 是否在组件挂载时自动发起首次请求，默认为 true
   */
  immediate?: boolean;
  /**
   * 自定义数据解析回调
   */
  formatResult?: (res: any) => { list: T[]; total: number };
}

/**
 * 通用分页列表管理 Hook
 */
export function usePagination<T = any, P extends Record<string, any> = Record<string, any>>(
  options: PaginationOptions<T, P>
) {
  const {
    fetchApi,
    defaultParams = {} as P,
    defaultPageSize = 10,
    defaultPageNum = 1,
    immediate = true,
    formatResult
  } = options;

  const isLoading = ref(false);
  const tableData = ref<T[]>([]) as { value: T[] };
  const total = ref(0);

  // 记录初始查询条件快照，便于重置
  const initialParams = { ...defaultParams };

  const searchParams = reactive({
    ...defaultParams,
    pageNum: defaultPageNum,
    pageSize: defaultPageSize
  }) as P & { pageNum: number; pageSize: number };

  const pageNum = toRef(searchParams, "pageNum");
  const pageSize = toRef(searchParams, "pageSize");

  /**
   * 默认数据格式化解析
   */
  const defaultFormatResult = (res: any): { list: T[]; total: number } => {
    if (res && Array.isArray(res.list)) {
      return { list: res.list, total: res.total ?? res.list.length };
    }
    if (Array.isArray(res)) {
      return { list: res, total: res.length };
    }
    return { list: [], total: 0 };
  };

  /**
   * 拉取分页列表数据
   */
  const fetchData = async () => {
    isLoading.value = true;
    try {
      const res = await fetchApi({ ...searchParams });
      const parser = formatResult ?? defaultFormatResult;
      const formatted = parser(res);
      tableData.value = formatted.list ?? [];
      total.value = formatted.total ?? 0;
    } catch {
      return;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 点击搜索：重置到第 1 页并拉取数据
   */
  const handleSearch = () => {
    searchParams.pageNum = 1;
    fetchData();
  };

  /**
   * 点击重置：恢复初始过滤条件，重置到第 1 页并拉取数据
   */
  const handleReset = (customReset?: () => void) => {
    if (typeof customReset === "function") {
      customReset();
    } else {
      for (const key of Object.keys(defaultParams)) {
        (searchParams as Record<string, any>)[key] = (initialParams as Record<string, any>)[key];
      }
    }
    searchParams.pageNum = 1;
    fetchData();
  };

  /**
   * 分页当前页码切换
   */
  const handleCurrentChange = (page: number) => {
    searchParams.pageNum = page;
    fetchData();
  };

  /**
   * 分页页码切换（别名兼容）
   */
  const handlePageChange = handleCurrentChange;

  /**
   * 每页条数切换：重置到第 1 页并拉取数据
   */
  const handleSizeChange = (size: number) => {
    searchParams.pageSize = size;
    searchParams.pageNum = 1;
    fetchData();
  };

  /**
   * 删除后刷新：若当前页数据全部被删且页码大于 1，则自动回退上一页
   */
  const handleDeleteRefresh = async (deleteCount = 1) => {
    if (tableData.value.length <= deleteCount && searchParams.pageNum > 1) {
      searchParams.pageNum--;
    }
    await fetchData();
  };

  if (immediate) {
    onMounted(() => {
      fetchData();
    });
  }

  return {
    isLoading,
    tableData,
    total,
    searchParams,
    pageNum,
    pageSize,
    fetchData,
    handleSearch,
    handleReset,
    handleCurrentChange,
    handlePageChange,
    handleSizeChange,
    handleDeleteRefresh
  };
}
