module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/web/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/web/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/web/app/admin/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/web/app/admin/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/web/lib/api.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// 在服务器端使用绝对 URL，客户端使用相对 URL
__turbopack_context__.s([
    "api",
    ()=>api
]);
const getBaseUrl = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // 服务器端：直接使用后端 URL
    return process.env.BACKEND_URL || 'http://localhost:3001';
};
async function fetchAPI(endpoint, options) {
    const API_BASE_URL = getBaseUrl();
    const url = `${API_BASE_URL}${endpoint}`;
    // Debug logging
    console.log('[API] Fetching:', url, '(server-side:', ("TURBOPACK compile-time value", "undefined") === 'undefined', ')');
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
    console.log('[API] Response status:', response.status, 'OK:', response.ok);
    if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] Error response:', errorText);
        throw new Error(errorText || 'API request failed');
    }
    const data = await response.json();
    console.log('[API] Response data:', Array.isArray(data) ? `${data.length} items` : 'data received');
    return data;
}
const api = {
    get: (endpoint, options)=>fetchAPI(endpoint, options),
    post: (endpoint, data, options)=>fetchAPI(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        }),
    put: (endpoint, data, options)=>fetchAPI(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    delete: (endpoint, options)=>fetchAPI(endpoint, {
            ...options,
            method: 'DELETE'
        })
};
}),
"[project]/web/lib/store.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 数据访问层 - 通过 API 调用后端服务
 */ __turbopack_context__.s([
    "store",
    ()=>store
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/api.ts [app-rsc] (ecmascript)");
;
const store = {
    // 文章相关
    getPostBySlug: async (slug)=>{
        try {
            const post = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"].get(`/api/posts/${slug}`);
            return convertPost(post);
        } catch (error) {
            console.error('Error fetching post by slug:', error);
            return null;
        }
    },
    getPostById: async (id)=>{
        try {
            const post = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"].get(`/api/posts/by-id/${id}`);
            return convertPost(post);
        } catch (error) {
            console.error('Error fetching post by id:', error);
            return null;
        }
    },
    getPostsByYear: async ()=>{
        try {
            const posts = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"].get('/api/posts');
            const grouped = {};
            posts.forEach((post)=>{
                const converted = convertPost(post);
                const year = new Date(converted.createdAt).getFullYear().toString();
                if (!grouped[year]) {
                    grouped[year] = [];
                }
                grouped[year].push(converted);
            });
            return grouped;
        } catch (error) {
            console.error('Error fetching archive:', error);
            return {};
        }
    },
    getAllPosts: async (sortBy = 'latest', categoryId)=>{
        try {
            const params = new URLSearchParams({
                sortBy,
                ...categoryId && {
                    categoryId
                }
            });
            console.log('[Store] Fetching posts with params:', params.toString());
            const posts = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"].get(`/api/posts?${params}`);
            console.log('[Store] Received posts:', posts.length, 'posts');
            return posts.map(convertPost);
        } catch (error) {
            console.error('[Store] Error fetching posts:', error);
            return [];
        }
    },
    getAllPostsAdmin: async ()=>{
        try {
            const posts = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"].get('/api/posts/admin');
            return posts.map(convertPost);
        } catch (error) {
            console.error('Error fetching admin posts:', error);
            return [];
        }
    },
    // 分类相关
    getAllCategories: async ()=>{
        try {
            const categories = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"].get('/api/categories');
            return categories.map(convertCategory);
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },
    getCategoryById: async (id)=>{
        try {
            const category = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"].get(`/api/categories/${id}`);
            return convertCategory(category);
        } catch (error) {
            console.error('Error fetching category:', error);
            return null;
        }
    },
    getPostCountByCategory: async (categoryId)=>{
        try {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"].get(`/api/categories/${categoryId}/post-count`);
            return result.count;
        } catch (error) {
            console.error('Error fetching post count:', error);
            return 0;
        }
    },
    // 评论相关
    getCommentsByPostId: async (postId)=>{
        try {
            const comments = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"].get(`/api/comments/post/${postId}`);
            return comments.map(convertComment);
        } catch (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
    },
    // 认证相关
    validateSession: async (token)=>{
        try {
            const user = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"].get('/api/auth/verify', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return user;
        } catch (error) {
            console.error('Error validating session:', error);
            return null;
        }
    }
};
// 辅助函数 - 转换数据库类型到前端类型
function convertPost(post) {
    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage || undefined,
        published: Boolean(post.published),
        createdAt: post.createdAt instanceof Date ? post.createdAt.getTime() : post.createdAt,
        updatedAt: post.updatedAt instanceof Date ? post.updatedAt.getTime() : post.updatedAt,
        categoryId: post.categoryId || undefined,
        views: post.views,
        likes: post.likes,
        tags: post.tags,
        category: post.category ? convertCategory(post.category) : undefined,
        commentsCount: post.commentsCount
    };
}
function convertCategory(category) {
    return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || undefined,
        createdAt: category.createdAt instanceof Date ? category.createdAt.getTime() : category.createdAt
    };
}
function convertComment(comment) {
    return {
        id: comment.id,
        postId: comment.postId,
        author: comment.author,
        content: comment.content,
        createdAt: comment.createdAt instanceof Date ? comment.createdAt.getTime() : comment.createdAt
    };
}
}),
"[project]/web/components/post-editor.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "PostEditor",
    ()=>PostEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.10_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const PostEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call PostEditor() from the server but PostEditor is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/web/components/post-editor.tsx <module evaluation>", "PostEditor");
}),
"[project]/web/components/post-editor.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "PostEditor",
    ()=>PostEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.10_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const PostEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call PostEditor() from the server but PostEditor is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/web/components/post-editor.tsx", "PostEditor");
}),
"[project]/web/components/post-editor.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$post$2d$editor$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/web/components/post-editor.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$post$2d$editor$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/web/components/post-editor.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$post$2d$editor$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/web/app/admin/edit/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2026-01-27 20:52:26
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2026-01-27 20:52:34
 * @FilePath: /blog/my-next-app/app/admin/edit/id/page.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */ __turbopack_context__.s([
    "default",
    ()=>EditPostPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.10_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.10_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.10_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/store.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$post$2d$editor$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/post-editor.tsx [app-rsc] (ecmascript)");
;
;
;
;
async function EditPostPage({ params }) {
    const { id } = await params;
    const post = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$store$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["store"].getPostById(id);
    if (!post) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$post$2d$editor$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PostEditor"], {
        post: post
    }, void 0, false, {
        fileName: "[project]/web/app/admin/edit/[id]/page.tsx",
        lineNumber: 25,
        columnNumber: 10
    }, this);
}
}),
"[project]/web/app/admin/edit/[id]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/web/app/admin/edit/[id]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e3e4ae12._.js.map