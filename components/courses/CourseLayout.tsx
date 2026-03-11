import { useState, useEffect } from "react";
import ModuleSidebar from "./ModuleSidebar";
import TopicList from "./TopicList";
import TopicContent from "./TopicContent";
import { getModule, getCourse } from "@/lib/course";

export default function CourseLayout({ course: initialCourse, userId }: any) {
  const [course, setCourse] = useState<any>(initialCourse);

  const [activeModule, setActiveModule] = useState<number>(1);
  const [activeTopic, setActiveTopic] = useState<number | null>(null);

  const [moduleData, setModuleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const outlines = course.moduleOutlines || [];

  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function pollCourse() {
      try {
        const updated = await getCourse(userId, course.courseId);
        setCourse(updated);
      } catch (e) {
        console.error("Error polling course:", e);
      }
    }

    timer = setInterval(pollCourse, 4000);

    return () => clearInterval(timer);
  }, [userId, course.courseId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function poll() {
      try {
        const data = await getModule(userId, course.courseId, activeModule);
        setModuleData(data);
        setLoading(false);
      } catch (e) {
        console.error("Error polling module:", e);
      }
    }

    poll();
    timer = setInterval(poll, 3000);

    return () => clearInterval(timer);
  }, [activeModule, userId, course.courseId]);

  const handleBackToOverview = () => {
    setActiveTopic(null);
  };

  const skeleton = outlines.find(
    (m: any) => Number(m.moduleNumber) === activeModule
  );

  const generatedSections = moduleData?.sections || [];

  const generatedIntro = generatedSections.find(
    (s: any) => s.sectionId === "INTRO"
  );

  const introTopic = generatedIntro || {
    topicNumber: 1,
    sectionNumber: 1,
    sectionId: "INTRO",
    title: "Introduksjon",
    bodyText: "Introduksjonen genereres. Vennligst vent...",
  };

  const realTopics = (skeleton?.sections || []).map((s: any, index: number) => {
    const expectedTopicNumber = index + 2;
    const expectedSectionNumber = index + 2;

    const generated =
      generatedSections.find((gen: any) => gen.sectionId === s.id) ||
      generatedSections.find(
        (gen: any) => Number(gen.sectionNumber) === expectedSectionNumber
      ) ||
      generatedSections.find(
        (gen: any) => Number(gen.topicNumber) === expectedTopicNumber
      );

    return (
      generated || {
        ...s,
        topicNumber: expectedTopicNumber,
        sectionNumber: expectedSectionNumber,
      }
    );
  });

  const mergedTopics = [introTopic, ...realTopics];

  const topicStatusToUse: Record<string, any> = {
    ...(moduleData?.topicStatus || {}),
    "1": {
      hasContent: true,
      clickable: true,
    },
  };

  const moduleStatuses: Record<number, "locked" | "generating" | "generated"> =
    {};

  outlines.forEach((m: any) => {
    const moduleNumber = Number(m.moduleNumber);

    if (m.sections && m.sections.length > 0) {
      moduleStatuses[moduleNumber] = "generated";
    } else {
      moduleStatuses[moduleNumber] = "generating";
    }
  });

  return (
    <div className="flex">
      <ModuleSidebar
        modules={outlines}
        activeIndex={activeModule - 1}
        onSelect={(i) => {
          setActiveModule(i + 1);
          setActiveTopic(null);
        }}
        isCollapsed={false}
        onToggle={() => {}}
        moduleStatuses={moduleStatuses}
      />

      <div className="p-6 flex-1">
        {loading && <p>Laster modul...</p>}

        {!loading && !activeTopic && (
          <TopicList
            topics={mergedTopics}
            topicStatus={topicStatusToUse}
            onSelectTopic={(t: any) => setActiveTopic(t.topicNumber)}
          />
        )}

        {!loading && activeTopic && (
          <TopicContent
            topic={mergedTopics.find(
              (t: any) => t.topicNumber === activeTopic
            )}
            onBack={handleBackToOverview}
            hasNext={mergedTopics.some(
              (t: any) => t.topicNumber === (activeTopic || 0) + 1
            )}
            onNext={() => {
              const next = (activeTopic || 0) + 1;

              const exists = mergedTopics.some(
                (t: any) => t.topicNumber === next
              );

              if (exists) {
                setActiveTopic(next);
              } else {
                setActiveTopic(null);
              }
            }}
            hasPrev={(activeTopic || 0) > 1}
            onPrev={() => {
              const prev = (activeTopic || 0) - 1;

              if (prev >= 1) {
                setActiveTopic(prev);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}