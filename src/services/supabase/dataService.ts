
/**
 * Service for interacting with Supabase data
 */

import { supabase } from "@/lib/supabase";

const dataService = {
  /**
   * Get all data from a specified table
   * @param table - The table to query
   * @returns Promise resolving to the data or null
   */
  getAllData: async (table: string) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) {
        console.error(`Error fetching data from ${table}:`, error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Error in getAllData(${table}):`, error);
      return null;
    }
  },
  
  /**
   * Get a single record by ID
   * @param table - The table to query
   * @param id - The record ID
   * @returns Promise resolving to the data or null
   */
  getById: async (table: string, id: string) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error(`Error fetching data from ${table} with id ${id}:`, error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Error in getById(${table}, ${id}):`, error);
      return null;
    }
  },
  
  /**
   * Insert data into a table
   * @param table - The table to insert into
   * @param data - The data to insert
   * @returns Promise resolving to the inserted data or null
   */
  insertData: async (table: string, data: any) => {
    try {
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) {
        console.error(`Error inserting data into ${table}:`, error);
        return null;
      }
      
      return insertedData;
    } catch (error) {
      console.error(`Error in insertData(${table}):`, error);
      return null;
    }
  },
  
  /**
   * Update data in a table
   * @param table - The table to update
   * @param id - The record ID
   * @param data - The data to update
   * @returns Promise resolving to the updated data or null
   */
  updateData: async (table: string, id: string, data: any) => {
    try {
      const { data: updatedData, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error(`Error updating data in ${table} with id ${id}:`, error);
        return null;
      }
      
      return updatedData;
    } catch (error) {
      console.error(`Error in updateData(${table}, ${id}):`, error);
      return null;
    }
  },
  
  /**
   * Delete data from a table
   * @param table - The table to delete from
   * @param id - The record ID
   * @returns Promise resolving to success status
   */
  deleteData: async (table: string, id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting data from ${table} with id ${id}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error in deleteData(${table}, ${id}):`, error);
      return false;
    }
  }
};

export default dataService;
