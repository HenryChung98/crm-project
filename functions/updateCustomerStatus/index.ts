// import { serve } from "std/server";
// import { createClient } from "@/utils/supabase/server";

// serve(async (req) => {
//   const supabase = await createClient();

//   try {
//     // 30일 전 날짜 계산
//     const thresholdDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

//     // status가 'new' 이고 created_at이 30일 이전인 고객을 'active'로 업데이트
//     const { data, error } = await supabase
//       .from("customers")
//       .update({ status: "active" })
//       .lte("created_at", thresholdDate)
//       .eq("status", "new");

//     if (error) {
//       return new Response(JSON.stringify({ error: error.message }), { status: 500 });
//     }

//     return new Response(
//       JSON.stringify({ message: `Updated ${data?.length || 0} customers.` }),
//       { status: 200 }
//     );
//   } catch (err) {
//     return new Response(JSON.stringify({ error: err.message }), { status: 500 });
//   }
// });
