export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      automation_events: {
        Row: {
          board_id: string | null
          card_data: Json | null
          created_at: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          processed: boolean | null
          user_id: string | null
        }
        Insert: {
          board_id?: string | null
          card_data?: Json | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          processed?: boolean | null
          user_id?: string | null
        }
        Update: {
          board_id?: string | null
          card_data?: Json | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          processed?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_events_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "custom_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          action_result: Json | null
          automation_id: string | null
          error_message: string | null
          executed_at: string | null
          id: string
          status: string | null
          trigger_data: Json | null
        }
        Insert: {
          action_result?: Json | null
          automation_id?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status?: string | null
          trigger_data?: Json | null
        }
        Update: {
          action_result?: Json | null
          automation_id?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status?: string | null
          trigger_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          action_config: Json | null
          action_type: string
          board_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          entity_type: string
          id: string
          is_active: boolean | null
          name: string
          scope: string | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          board_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type: string
          id?: string
          is_active?: boolean | null
          name: string
          scope?: string | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          board_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          scope?: string | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automations_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "custom_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      base_dados: {
        Row: {
          content: string
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      board_columns: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          position: number
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          position?: number
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      board_settings: {
        Row: {
          board_type: string
          created_at: string | null
          hide_overdue_columns: string[] | null
          id: string
          updated_at: string | null
        }
        Insert: {
          board_type: string
          created_at?: string | null
          hide_overdue_columns?: string[] | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          board_type?: string
          created_at?: string | null
          hide_overdue_columns?: string[] | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      checkin_sessions: {
        Row: {
          conversation: Json | null
          created_at: string | null
          current_task_index: number | null
          id: string
          pending_updates: Json | null
          status: string | null
          tasks: Json
          updated_at: string | null
          user_id: string
          whatsapp: string
        }
        Insert: {
          conversation?: Json | null
          created_at?: string | null
          current_task_index?: number | null
          id?: string
          pending_updates?: Json | null
          status?: string | null
          tasks: Json
          updated_at?: string | null
          user_id: string
          whatsapp: string
        }
        Update: {
          conversation?: Json | null
          created_at?: string | null
          current_task_index?: number | null
          id?: string
          pending_updates?: Json | null
          status?: string | null
          tasks?: Json
          updated_at?: string | null
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      cliente_activities: {
        Row: {
          action_type: string
          cliente_id: number
          created_at: string
          description: string | null
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          cliente_id: number
          created_at?: string
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          cliente_id?: number
          created_at?: string
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_activities_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "metadata_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_checklist_items: {
        Row: {
          cliente_id: number
          completed_at: string | null
          completed_by: string | null
          concluido: boolean
          created_at: string
          id: string
          position: number
          texto: string
          updated_at: string
        }
        Insert: {
          cliente_id: number
          completed_at?: string | null
          completed_by?: string | null
          concluido?: boolean
          created_at?: string
          id?: string
          position?: number
          texto: string
          updated_at?: string
        }
        Update: {
          cliente_id?: number
          completed_at?: string | null
          completed_by?: string | null
          concluido?: boolean
          created_at?: string
          id?: string
          position?: number
          texto?: string
          updated_at?: string
        }
        Relationships: []
      }
      cliente_checklist_template: {
        Row: {
          created_at: string
          id: string
          position: number
          texto: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          texto: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          texto?: string
          updated_at?: string
        }
        Relationships: []
      }
      cliente_comments: {
        Row: {
          cliente_id: number
          content: string
          created_at: string | null
          id: string
          mentions: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cliente_id: number
          content: string
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cliente_id?: number
          content?: string
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_comments_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "metadata_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicacoes_sugeridas: {
        Row: {
          cliente_id: number | null
          contexto: Json | null
          created_at: string | null
          group_id: string | null
          id: string
          mensagem_final: string | null
          mensagem_sugerida: string
          motivo: string | null
          projeto_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          tipo_comunicacao: string | null
        }
        Insert: {
          cliente_id?: number | null
          contexto?: Json | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          mensagem_final?: string | null
          mensagem_sugerida: string
          motivo?: string | null
          projeto_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          tipo_comunicacao?: string | null
        }
        Update: {
          cliente_id?: number | null
          contexto?: Json | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          mensagem_final?: string | null
          mensagem_sugerida?: string
          motivo?: string | null
          projeto_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          tipo_comunicacao?: string | null
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          chave: string
          updated_at: string | null
          valor: string
        }
        Insert: {
          chave: string
          updated_at?: string | null
          valor: string
        }
        Update: {
          chave?: string
          updated_at?: string | null
          valor?: string
        }
        Relationships: []
      }
      custo_mensal: {
        Row: {
          cliente: string | null
          custo_hrs_h: number | null
          custo_operacional: number | null
          custos_extras: Json | null
          data: string | null
          gpt: number | null
          helena: number | null
          horas_homem: number | null
          id_cliente: number
          imposto: number | null
          lovable: number | null
          margem_liquida: number | null
          margem_liquida_valor: number | null
          margem_operacional: number | null
          margem_operacional_valor: number | null
          mrr: number | null
          previsao_consolidado: string | null
          primary: string
          servidor: number | null
          supabase: number | null
          uuid: string | null
          zapi: number | null
        }
        Insert: {
          cliente?: string | null
          custo_hrs_h?: number | null
          custo_operacional?: number | null
          custos_extras?: Json | null
          data?: string | null
          gpt?: number | null
          helena?: number | null
          horas_homem?: number | null
          id_cliente: number
          imposto?: number | null
          lovable?: number | null
          margem_liquida?: number | null
          margem_liquida_valor?: number | null
          margem_operacional?: number | null
          margem_operacional_valor?: number | null
          mrr?: number | null
          previsao_consolidado?: string | null
          primary?: string
          servidor?: number | null
          supabase?: number | null
          uuid?: string | null
          zapi?: number | null
        }
        Update: {
          cliente?: string | null
          custo_hrs_h?: number | null
          custo_operacional?: number | null
          custos_extras?: Json | null
          data?: string | null
          gpt?: number | null
          helena?: number | null
          horas_homem?: number | null
          id_cliente?: number
          imposto?: number | null
          lovable?: number | null
          margem_liquida?: number | null
          margem_liquida_valor?: number | null
          margem_operacional?: number | null
          margem_operacional_valor?: number | null
          mrr?: number | null
          previsao_consolidado?: string | null
          primary?: string
          servidor?: number | null
          supabase?: number | null
          uuid?: string | null
          zapi?: number | null
        }
        Relationships: []
      }
      custom_board_card_activities: {
        Row: {
          action_type: string
          card_id: string
          created_at: string | null
          description: string | null
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          card_id: string
          created_at?: string | null
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          card_id?: string
          created_at?: string | null
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_board_card_activities_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "custom_board_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_board_card_attachments: {
        Row: {
          card_id: string
          created_at: string
          created_by: string | null
          file_type: string
          id: string
          name: string
          size_bytes: number | null
          storage_path: string
        }
        Insert: {
          card_id: string
          created_at?: string
          created_by?: string | null
          file_type?: string
          id?: string
          name: string
          size_bytes?: number | null
          storage_path: string
        }
        Update: {
          card_id?: string
          created_at?: string
          created_by?: string | null
          file_type?: string
          id?: string
          name?: string
          size_bytes?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_board_card_attachments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "custom_board_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_board_card_comments: {
        Row: {
          card_id: string
          content: string
          created_at: string | null
          id: string
          mentions: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_id: string
          content: string
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_id?: string
          content?: string
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_board_card_comments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "custom_board_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_board_cards: {
        Row: {
          archived: boolean | null
          assigned_users: string[] | null
          attachments_count: number | null
          board_id: string
          checklist: Json | null
          column_id: string | null
          comments_count: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          position: number | null
          priority: string | null
          start_date: string | null
          tags: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          archived?: boolean | null
          assigned_users?: string[] | null
          attachments_count?: number | null
          board_id: string
          checklist?: Json | null
          column_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number | null
          priority?: string | null
          start_date?: string | null
          tags?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          archived?: boolean | null
          assigned_users?: string[] | null
          attachments_count?: number | null
          board_id?: string
          checklist?: Json | null
          column_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number | null
          priority?: string | null
          start_date?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_board_cards_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "custom_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_board_cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "custom_board_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_board_columns: {
        Row: {
          board_id: string
          color: string | null
          created_at: string | null
          id: string
          is_done_column: boolean | null
          name: string
          position: number
          updated_at: string | null
        }
        Insert: {
          board_id: string
          color?: string | null
          created_at?: string | null
          id?: string
          is_done_column?: boolean | null
          name: string
          position?: number
          updated_at?: string | null
        }
        Update: {
          board_id?: string
          color?: string | null
          created_at?: string | null
          id?: string
          is_done_column?: boolean | null
          name?: string
          position?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_board_columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "custom_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_boards: {
        Row: {
          allowed_users: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          hide_overdue_columns: string[] | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          allowed_users?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hide_overdue_columns?: string[] | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          allowed_users?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hide_overdue_columns?: string[] | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      daily_checkin_config: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          questions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          questions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          questions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      daily_checkin_user_config: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          schedule_time: string
          selected_columns_projetos: string[]
          selected_columns_tarefas: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          schedule_time?: string
          selected_columns_projetos?: string[]
          selected_columns_tarefas?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          schedule_time?: string
          selected_columns_projetos?: string[]
          selected_columns_tarefas?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      diagnostico: {
        Row: {
          apresentacao_gamma_url: string | null
          company: string | null
          id: number
          n_funcionarios: number | null
          nome: string
          pontos_fortes_fracos: Json | null
          ps: Json | null
          recomendacoes: Json | null
          roadmap: Json | null
          score: Json | null
          sobre: string | null
          telefone: string | null
          usuario: string | null
          website: string | null
        }
        Insert: {
          apresentacao_gamma_url?: string | null
          company?: string | null
          id?: number
          n_funcionarios?: number | null
          nome: string
          pontos_fortes_fracos?: Json | null
          ps?: Json | null
          recomendacoes?: Json | null
          roadmap?: Json | null
          score?: Json | null
          sobre?: string | null
          telefone?: string | null
          usuario?: string | null
          website?: string | null
        }
        Update: {
          apresentacao_gamma_url?: string | null
          company?: string | null
          id?: number
          n_funcionarios?: number | null
          nome?: string
          pontos_fortes_fracos?: Json | null
          ps?: Json | null
          recomendacoes?: Json | null
          roadmap?: Json | null
          score?: Json | null
          sobre?: string | null
          telefone?: string | null
          usuario?: string | null
          website?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      followupsara: {
        Row: {
          dealId: string | null
          done: boolean | null
          fez_follow_up: boolean | null
          fupStage: number | null
          lastmessage: string | null
          telefone: string
          ultima_interacao: string | null
          ultimo_fup: string | null
        }
        Insert: {
          dealId?: string | null
          done?: boolean | null
          fez_follow_up?: boolean | null
          fupStage?: number | null
          lastmessage?: string | null
          telefone: string
          ultima_interacao?: string | null
          ultimo_fup?: string | null
        }
        Update: {
          dealId?: string | null
          done?: boolean | null
          fez_follow_up?: boolean | null
          fupStage?: number | null
          lastmessage?: string | null
          telefone?: string
          ultima_interacao?: string | null
          ultimo_fup?: string | null
        }
        Relationships: []
      }
      gestao_geral: {
        Row: {
          ano: number
          churn_receita: number | null
          clientes_implantacao: number | null
          clientes_nao_recorrentes: number | null
          clientes_producao: number | null
          clientes_recorrentes: number | null
          created_at: string | null
          downgrade: number | null
          downgrade_receita: number | null
          faturamento_total: number | null
          gastos_total: number | null
          grow_receita: number | null
          id: string
          leads_gerados: number | null
          logo_churn: number | null
          logo_grow: number | null
          mes: number
          mrr_dia_30: number | null
          nmrr: number | null
          num_vendas: number | null
          parcela_projetos: number | null
          receita_esperada_total: number | null
          resultado: number | null
          updated_at: string | null
        }
        Insert: {
          ano: number
          churn_receita?: number | null
          clientes_implantacao?: number | null
          clientes_nao_recorrentes?: number | null
          clientes_producao?: number | null
          clientes_recorrentes?: number | null
          created_at?: string | null
          downgrade?: number | null
          downgrade_receita?: number | null
          faturamento_total?: number | null
          gastos_total?: number | null
          grow_receita?: number | null
          id?: string
          leads_gerados?: number | null
          logo_churn?: number | null
          logo_grow?: number | null
          mes: number
          mrr_dia_30?: number | null
          nmrr?: number | null
          num_vendas?: number | null
          parcela_projetos?: number | null
          receita_esperada_total?: number | null
          resultado?: number | null
          updated_at?: string | null
        }
        Update: {
          ano?: number
          churn_receita?: number | null
          clientes_implantacao?: number | null
          clientes_nao_recorrentes?: number | null
          clientes_producao?: number | null
          clientes_recorrentes?: number | null
          created_at?: string | null
          downgrade?: number | null
          downgrade_receita?: number | null
          faturamento_total?: number | null
          gastos_total?: number | null
          grow_receita?: number | null
          id?: string
          leads_gerados?: number | null
          logo_churn?: number | null
          logo_grow?: number | null
          mes?: number
          mrr_dia_30?: number | null
          nmrr?: number | null
          num_vendas?: number | null
          parcela_projetos?: number | null
          receita_esperada_total?: number | null
          resultado?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      group_messages: {
        Row: {
          id: number
          message: string | null
          message_id: string
          senderName: string | null
          session_id: string
          status_read: boolean | null
          timestamp: string | null
        }
        Insert: {
          id?: number
          message?: string | null
          message_id: string
          senderName?: string | null
          session_id: string
          status_read?: boolean | null
          timestamp?: string | null
        }
        Update: {
          id?: number
          message?: string | null
          message_id?: string
          senderName?: string | null
          session_id?: string
          status_read?: boolean | null
          timestamp?: string | null
        }
        Relationships: []
      }
      historico_mrr: {
        Row: {
          ano: number | null
          clientId: number
          created_at: string | null
          descricao: string | null
          id: number
          mes: number | null
          mrr: number | null
          nome: string | null
          status: string | null
        }
        Insert: {
          ano?: number | null
          clientId: number
          created_at?: string | null
          descricao?: string | null
          id?: number
          mes?: number | null
          mrr?: number | null
          nome?: string | null
          status?: string | null
        }
        Update: {
          ano?: number | null
          clientId?: number
          created_at?: string | null
          descricao?: string | null
          id?: number
          mes?: number | null
          mrr?: number | null
          nome?: string | null
          status?: string | null
        }
        Relationships: []
      }
      interacoes: {
        Row: {
          aprovado: boolean | null
          canal: string
          contato: string
          criado_em: string | null
          id: string
          motivo_reprovacao: string | null
          prompt: string | null
          resposta_ia: string
          session_id: string | null
        }
        Insert: {
          aprovado?: boolean | null
          canal?: string
          contato: string
          criado_em?: string | null
          id?: string
          motivo_reprovacao?: string | null
          prompt?: string | null
          resposta_ia: string
          session_id?: string | null
        }
        Update: {
          aprovado?: boolean | null
          canal?: string
          contato?: string
          criado_em?: string | null
          id?: string
          motivo_reprovacao?: string | null
          prompt?: string | null
          resposta_ia?: string
          session_id?: string | null
        }
        Relationships: []
      }
      memoriagruposia: {
        Row: {
          data: string | null
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          data?: string | null
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          data?: string | null
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      metadata_clientes: {
        Row: {
          canal_aquisicao: string | null
          categoria: string | null
          cnpj: string | null
          column_id: string | null
          data_inicio: string | null
          dataEntregaV1: string | null
          description: string | null
          dia_pagamento: number | null
          enviar_nps: boolean | null
          group_id: string | null
          helena: boolean | null
          horas: number
          hs_inadimplencia: number | null
          hs_resultado: number | null
          hs_suporte: number | null
          id: number
          name: string | null
          position: number | null
          pronto_grow: boolean | null
          receita: number | null
          responsavelTecnico: Json | null
          status: string | null
          task_id: string | null
          Tipo: string | null
          user_id: string | null
          valor_implantacao: number | null
          valor_projeto: number | null
        }
        Insert: {
          canal_aquisicao?: string | null
          categoria?: string | null
          cnpj?: string | null
          column_id?: string | null
          data_inicio?: string | null
          dataEntregaV1?: string | null
          description?: string | null
          dia_pagamento?: number | null
          enviar_nps?: boolean | null
          group_id?: string | null
          helena?: boolean | null
          horas?: number
          hs_inadimplencia?: number | null
          hs_resultado?: number | null
          hs_suporte?: number | null
          id?: number
          name?: string | null
          position?: number | null
          pronto_grow?: boolean | null
          receita?: number | null
          responsavelTecnico?: Json | null
          status?: string | null
          task_id?: string | null
          Tipo?: string | null
          user_id?: string | null
          valor_implantacao?: number | null
          valor_projeto?: number | null
        }
        Update: {
          canal_aquisicao?: string | null
          categoria?: string | null
          cnpj?: string | null
          column_id?: string | null
          data_inicio?: string | null
          dataEntregaV1?: string | null
          description?: string | null
          dia_pagamento?: number | null
          enviar_nps?: boolean | null
          group_id?: string | null
          helena?: boolean | null
          horas?: number
          hs_inadimplencia?: number | null
          hs_resultado?: number | null
          hs_suporte?: number | null
          id?: number
          name?: string | null
          position?: number | null
          pronto_grow?: boolean | null
          receita?: number | null
          responsavelTecnico?: Json | null
          status?: string | null
          task_id?: string | null
          Tipo?: string | null
          user_id?: string | null
          valor_implantacao?: number | null
          valor_projeto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metadata_clientes_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "board_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      nps: {
        Row: {
          client: string | null
          client_phone: string | null
          data: string | null
          id: number
          NPS: number | null
          pergunta1: string | null
          pergunta2: string | null
        }
        Insert: {
          client?: string | null
          client_phone?: string | null
          data?: string | null
          id?: number
          NPS?: number | null
          pergunta1?: string | null
          pergunta2?: string | null
        }
        Update: {
          client?: string | null
          client_phone?: string | null
          data?: string | null
          id?: number
          NPS?: number | null
          pergunta1?: string | null
          pergunta2?: string | null
        }
        Relationships: []
      }
      nps_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      onboarding_chat_history: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      private_messages: {
        Row: {
          chatlid: string | null
          chatname: string | null
          id: number
          message: string | null
          message_id: string | null
          phone: string | null
          senderName: string | null
        }
        Insert: {
          chatlid?: string | null
          chatname?: string | null
          id?: never
          message?: string | null
          message_id?: string | null
          phone?: string | null
          senderName?: string | null
        }
        Update: {
          chatlid?: string | null
          chatname?: string | null
          id?: never
          message?: string | null
          message_id?: string | null
          phone?: string | null
          senderName?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      projeto_activities: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          projeto_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          projeto_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          projeto_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projeto_activities_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["project_id"]
          },
        ]
      }
      projeto_board_columns: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          position: number
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          position?: number
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      projeto_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          mentions: string[] | null
          projeto_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          projeto_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          projeto_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projeto_comments_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["project_id"]
          },
        ]
      }
      projeto_snapshots: {
        Row: {
          ano: number
          company_name: string | null
          created_at: string | null
          id: number
          mes: number
          monthly_value: number | null
          project_id: string
          responsaveis: Json | null
          responsavel_horas: Json | null
          status_name: string | null
        }
        Insert: {
          ano: number
          company_name?: string | null
          created_at?: string | null
          id?: never
          mes: number
          monthly_value?: number | null
          project_id: string
          responsaveis?: Json | null
          responsavel_horas?: Json | null
          status_name?: string | null
        }
        Update: {
          ano?: number
          company_name?: string | null
          created_at?: string | null
          id?: never
          mes?: number
          monthly_value?: number | null
          project_id?: string
          responsaveis?: Json | null
          responsavel_horas?: Json | null
          status_name?: string | null
        }
        Relationships: []
      }
      projeto_tarefas: {
        Row: {
          assigned_user: string | null
          assigned_users: string[] | null
          column_id: string | null
          created_at: string
          depth: number | null
          descricao: string | null
          due_date: string | null
          id: string
          message_sent: boolean
          message_sent_at: string | null
          parent_id: string | null
          position: number | null
          priority: string | null
          priorizado: boolean | null
          projeto_id: string
          reminder_date: string | null
          start_date: string | null
          status: string | null
          template_id: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          assigned_user?: string | null
          assigned_users?: string[] | null
          column_id?: string | null
          created_at?: string
          depth?: number | null
          descricao?: string | null
          due_date?: string | null
          id?: string
          message_sent?: boolean
          message_sent_at?: string | null
          parent_id?: string | null
          position?: number | null
          priority?: string | null
          priorizado?: boolean | null
          projeto_id: string
          reminder_date?: string | null
          start_date?: string | null
          status?: string | null
          template_id?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          assigned_user?: string | null
          assigned_users?: string[] | null
          column_id?: string | null
          created_at?: string
          depth?: number | null
          descricao?: string | null
          due_date?: string | null
          id?: string
          message_sent?: boolean
          message_sent_at?: string | null
          parent_id?: string | null
          position?: number | null
          priority?: string | null
          priorizado?: boolean | null
          projeto_id?: string
          reminder_date?: string | null
          start_date?: string | null
          status?: string | null
          template_id?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projeto_tarefas_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "tarefa_board_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_tarefas_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "projeto_tarefas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_tarefas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "projeto_tarefas_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos: {
        Row: {
          additional_info: string | null
          business_type: string | null
          client_type: string | null
          cnpj: string | null
          column_id: string | null
          company_context: string | null
          company_name: string | null
          created_at: string | null
          export_wpp: string | null
          financial_email: string | null
          financial_whatsapp: string | null
          horas: number | null
          id_cliente: number | null
          implementation_value: number | null
          integrations: Json | null
          monthly_date: number | null
          monthly_value: number | null
          negotiation_details: string | null
          platforms: Json | null
          position: number | null
          project_id: string
          project_name: string | null
          project_scope: string | null
          proposal_link: string | null
          responsavel_horas: Json | null
          responsavelTecnico: Json | null
          responsible_email: string | null
          responsible_name: string | null
          responsible_whatsapp: string | null
          sinal_pago: boolean | null
          site: string | null
          status: string | null
          timing: string | null
          transcript: string | null
          updated_at: string | null
          user_id: string | null
          v1_delivery_date: string | null
        }
        Insert: {
          additional_info?: string | null
          business_type?: string | null
          client_type?: string | null
          cnpj?: string | null
          column_id?: string | null
          company_context?: string | null
          company_name?: string | null
          created_at?: string | null
          export_wpp?: string | null
          financial_email?: string | null
          financial_whatsapp?: string | null
          horas?: number | null
          id_cliente?: number | null
          implementation_value?: number | null
          integrations?: Json | null
          monthly_date?: number | null
          monthly_value?: number | null
          negotiation_details?: string | null
          platforms?: Json | null
          position?: number | null
          project_id?: string
          project_name?: string | null
          project_scope?: string | null
          proposal_link?: string | null
          responsavel_horas?: Json | null
          responsavelTecnico?: Json | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_whatsapp?: string | null
          sinal_pago?: boolean | null
          site?: string | null
          status?: string | null
          timing?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
          v1_delivery_date?: string | null
        }
        Update: {
          additional_info?: string | null
          business_type?: string | null
          client_type?: string | null
          cnpj?: string | null
          column_id?: string | null
          company_context?: string | null
          company_name?: string | null
          created_at?: string | null
          export_wpp?: string | null
          financial_email?: string | null
          financial_whatsapp?: string | null
          horas?: number | null
          id_cliente?: number | null
          implementation_value?: number | null
          integrations?: Json | null
          monthly_date?: number | null
          monthly_value?: number | null
          negotiation_details?: string | null
          platforms?: Json | null
          position?: number | null
          project_id?: string
          project_name?: string | null
          project_scope?: string | null
          proposal_link?: string | null
          responsavel_horas?: Json | null
          responsavelTecnico?: Json | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_whatsapp?: string | null
          sinal_pago?: boolean | null
          site?: string | null
          status?: string | null
          timing?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
          v1_delivery_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "projeto_board_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos_overview: {
        Row: {
          board_stage: string | null
          checklist_name: string | null
          cliente_name: string | null
          created_at: string | null
          due_date: string | null
          id: string
          projeto_id: string
          projeto_name: string | null
          status: string | null
          tarefa_id: string
          updated_at: string | null
        }
        Insert: {
          board_stage?: string | null
          checklist_name?: string | null
          cliente_name?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          projeto_id: string
          projeto_name?: string | null
          status?: string | null
          tarefa_id: string
          updated_at?: string | null
        }
        Update: {
          board_stage?: string | null
          checklist_name?: string | null
          cliente_name?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          projeto_id?: string
          projeto_name?: string | null
          status?: string | null
          tarefa_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prompt: {
        Row: {
          em_uso: boolean | null
          id: number
          prompt_antigo: string | null
          prompt_atual: string | null
        }
        Insert: {
          em_uso?: boolean | null
          id?: number
          prompt_antigo?: string | null
          prompt_atual?: string | null
        }
        Update: {
          em_uso?: boolean | null
          id?: number
          prompt_antigo?: string | null
          prompt_atual?: string | null
        }
        Relationships: []
      }
      rh_chat_history: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      sara_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      status_grow_down: {
        Row: {
          client_id: number | null
          created_at: string | null
          descricao: string | null
          descricao_forma_pagamento: string | null
          esforco: number | null
          grow_down: string | null
          id: number
          tipo: string | null
          tipo_grow: string | null
          valor: number | null
          valor_implantacao: number | null
        }
        Insert: {
          client_id?: number | null
          created_at?: string | null
          descricao?: string | null
          descricao_forma_pagamento?: string | null
          esforco?: number | null
          grow_down?: string | null
          id?: number
          tipo?: string | null
          tipo_grow?: string | null
          valor?: number | null
          valor_implantacao?: number | null
        }
        Update: {
          client_id?: number | null
          created_at?: string | null
          descricao?: string | null
          descricao_forma_pagamento?: string | null
          esforco?: number | null
          grow_down?: string | null
          id?: number
          tipo?: string | null
          tipo_grow?: string | null
          valor?: number | null
          valor_implantacao?: number | null
        }
        Relationships: []
      }
      tarefa_activities: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          tarefa_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          tarefa_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          tarefa_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_activities_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "projeto_tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefa_attachments: {
        Row: {
          created_at: string
          created_by: string | null
          file_type: string
          id: string
          name: string
          size_bytes: number | null
          storage_path: string
          tarefa_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_type?: string
          id?: string
          name: string
          size_bytes?: number | null
          storage_path: string
          tarefa_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_type?: string
          id?: string
          name?: string
          size_bytes?: number | null
          storage_path?: string
          tarefa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_attachments_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "projeto_tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefa_board_columns: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_done_column: boolean | null
          name: string
          position: number
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_done_column?: boolean | null
          name: string
          position?: number
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_done_column?: boolean | null
          name?: string
          position?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      tarefa_checklist_subitems: {
        Row: {
          checklist_item_id: string
          completed_at: string | null
          completed_by: string | null
          concluido: boolean | null
          created_at: string | null
          id: string
          position: number | null
          texto: string
        }
        Insert: {
          checklist_item_id: string
          completed_at?: string | null
          completed_by?: string | null
          concluido?: boolean | null
          created_at?: string | null
          id?: string
          position?: number | null
          texto: string
        }
        Update: {
          checklist_item_id?: string
          completed_at?: string | null
          completed_by?: string | null
          concluido?: boolean | null
          created_at?: string | null
          id?: string
          position?: number | null
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_checklist_subitems_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "tarefa_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefa_checklists: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          concluido: boolean | null
          created_at: string
          id: string
          position: number | null
          priorizado: boolean | null
          tarefa_id: string
          texto: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          concluido?: boolean | null
          created_at?: string
          id?: string
          position?: number | null
          priorizado?: boolean | null
          tarefa_id: string
          texto: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          concluido?: boolean | null
          created_at?: string
          id?: string
          position?: number | null
          priorizado?: boolean | null
          tarefa_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_checklists_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "projeto_tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefa_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          mentions: string[] | null
          tarefa_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          tarefa_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          tarefa_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_comments_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "projeto_tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefa_tag_assignments: {
        Row: {
          created_at: string
          id: string
          tag_id: string
          tarefa_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag_id: string
          tarefa_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag_id?: string
          tarefa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tarefa_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_tag_assignments_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "projeto_tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefa_tags: {
        Row: {
          color: string
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      task_dependencies: {
        Row: {
          created_at: string | null
          dependency_type: string | null
          depends_on_id: string
          id: string
          tarefa_id: string
        }
        Insert: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_id: string
          id?: string
          tarefa_id: string
        }
        Update: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_id?: string
          id?: string
          tarefa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_id_fkey"
            columns: ["depends_on_id"]
            isOneToOne: false
            referencedRelation: "projeto_tarefas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "projeto_tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      task_template_checklist_subitems: {
        Row: {
          created_at: string | null
          id: string
          position: number | null
          template_checklist_id: string
          texto: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          position?: number | null
          template_checklist_id: string
          texto: string
        }
        Update: {
          created_at?: string | null
          id?: string
          position?: number | null
          template_checklist_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_template_checklist_subitems_template_checklist_id_fkey"
            columns: ["template_checklist_id"]
            isOneToOne: false
            referencedRelation: "task_template_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      task_template_checklists: {
        Row: {
          created_at: string | null
          id: string
          position: number | null
          template_id: string
          texto: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          position?: number | null
          template_id: string
          texto: string
        }
        Update: {
          created_at?: string | null
          id?: string
          position?: number | null
          template_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_template_checklists_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          assigned_user_padrao: string | null
          assigned_users_padrao: string[] | null
          completion_message: string | null
          created_at: string | null
          created_by: string | null
          descricao_padrao: string | null
          description: string | null
          due_days_offset: number | null
          id: string
          is_default: boolean
          is_global: boolean | null
          name: string
          projeto_id: string | null
          send_message_on_complete: boolean
          titulo_padrao: string
          updated_at: string | null
        }
        Insert: {
          assigned_user_padrao?: string | null
          assigned_users_padrao?: string[] | null
          completion_message?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao_padrao?: string | null
          description?: string | null
          due_days_offset?: number | null
          id?: string
          is_default?: boolean
          is_global?: boolean | null
          name: string
          projeto_id?: string | null
          send_message_on_complete?: boolean
          titulo_padrao: string
          updated_at?: string | null
        }
        Update: {
          assigned_user_padrao?: string | null
          assigned_users_padrao?: string[] | null
          completion_message?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao_padrao?: string | null
          description?: string | null
          due_days_offset?: number | null
          id?: string
          is_default?: boolean
          is_global?: boolean | null
          name?: string
          projeto_id?: string | null
          send_message_on_complete?: boolean
          titulo_padrao?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["project_id"]
          },
        ]
      }
      time_entries: {
        Row: {
          billable: boolean | null
          cliente_id: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          projeto_id: string | null
          start_time: string
          tarefa_id: string | null
          user_id: string
        }
        Insert: {
          billable?: boolean | null
          cliente_id?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          projeto_id?: string | null
          start_time: string
          tarefa_id?: string | null
          user_id: string
        }
        Update: {
          billable?: boolean | null
          cliente_id?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          projeto_id?: string | null
          start_time?: string
          tarefa_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "metadata_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "time_entries_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "projeto_tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_api_keys: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_preview: string
          last_used_at: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_preview: string
          last_used_at?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_preview?: string
          last_used_at?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      wiki_files: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          file_type: string
          folder_id: string
          id: string
          name: string
          size_bytes: number | null
          storage_path: string | null
          tarefa_id: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          file_type?: string
          folder_id: string
          id?: string
          name: string
          size_bytes?: number | null
          storage_path?: string | null
          tarefa_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          file_type?: string
          folder_id?: string
          id?: string
          name?: string
          size_bytes?: number | null
          storage_path?: string | null
          tarefa_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "wiki_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_files_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "projeto_tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_folders: {
        Row: {
          created_at: string
          created_by: string | null
          entity_id: string | null
          entity_type: string | null
          folder_type: string
          id: string
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          folder_type?: string
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          folder_type?: string
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "wiki_folders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_board_access: { Args: { board_id: string }; Returns: boolean }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      slugify: { Args: { text_input: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
