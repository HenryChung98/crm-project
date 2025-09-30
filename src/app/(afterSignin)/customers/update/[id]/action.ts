"use server";
export async function updateCustomer(formData: FormData) {
  try {
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occured",
    };
  }
}
