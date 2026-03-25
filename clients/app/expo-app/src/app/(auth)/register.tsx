import { Link } from "expo-router";
import React from "react";
import { Controller } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Button, Spacing, Text, TextInput, colors } from "@/design-system";
import { useRegisterForm } from "@/hooks/useRegisterForm";

export default function RegisterScreen() {
  const { control, errors, isLoading, onSubmit } = useRegisterForm();
  console.log("erros", errors);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text size="t1">회원가입</Text>
          <Spacing size={8} />
          <Text size="b1" color="textSecondary">
            역할을 선택하고 시작하세요
          </Text>
        </View>

        <Spacing size={32} />

        {/* 역할 선택 */}
        <Text size="b2" style={{ fontWeight: "500" }}>
          역할
        </Text>
        <Spacing size={8} />
        <Controller
          control={control}
          name="roles"
          render={({ field: { onChange, value } }) => (
            <View style={styles.roleRow}>
              {(["PetOwner", "PetSitter"] as const).map((role) => (
                <Pressable
                  key={role}
                  onPress={() => onChange([role])}
                  style={[
                    styles.roleButton,
                    value[0] === role && styles.roleButtonActive,
                  ]}
                >
                  <Text
                    size="b2"
                    style={{
                      color:
                        value[0] === role ? colors.white : colors.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    {role === "PetOwner" ? "반려동물 주인" : "펫시터"}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />

        <Spacing size={16} />

        <Controller
          control={control}
          name="full_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="이름"
              placeholder="이름을 입력해주세요"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.full_name?.message}
            />
          )}
        />

        <Spacing size={16} />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="이메일"
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        <Spacing size={16} />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="비밀번호"
              placeholder="8자 이상 입력해주세요"
              secureTextEntry
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        {errors.root && (
          <>
            <Spacing size={8} />
            <Text size="caption" color="danger">
              {errors.root.message}
            </Text>
          </>
        )}

        <Spacing size={24} />

        <Button onPress={onSubmit} isLoading={isLoading}>
          가입하기
        </Button>

        <Spacing size={16} />

        <View style={styles.linkRow}>
          <Text size="b2" color="textSecondary">
            이미 계정이 있으신가요?{" "}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Text
              size="b2"
              style={{ color: colors.primary, fontWeight: "600" }}
            >
              로그인
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: { alignItems: "flex-start" },
  roleRow: { flexDirection: "row", gap: 12 },
  roleButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.grey200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
