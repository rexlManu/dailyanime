import moment from "moment";
import { useEffect, useState } from "react";
import { SELECT_MEDIAS } from "./graphql";
// import output from "./output.json";

var range = (start, end) =>
  [...Array(end - start + 1)].map((_, i) => start + i);

function App() {
  const [medias, setMedias] = useState([]);
  const [days] = useState(
    range(0, 6).map((i) => {
      const weekDay = moment().add(i, "d");
      return {
        time: weekDay,
        startTime: weekDay.startOf("day").valueOf(),
        endTime: weekDay.endOf("day").valueOf(),
        name: weekDay.format("ddd"),
      };
    })
  );
  useEffect(() => {
    async function fetchData() {
      let medias = [];
      let page = 1;
      while (true) {
        const response = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            query: SELECT_MEDIAS,
            variables: { page: page, type: "ANIME", status: "RELEASING" },
          }),
        });
        const data = await response.json();
        const { pageInfo, media } = data.data.Page;
        medias = medias.concat(media);
        if (pageInfo.lastPage === page) break;
        page++;
      }
      setMedias(medias);
      // setMedias(output);
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen lg:h-screen bg-gray-900 antialiased flex flex-col">
      <div className="bg-gray-800 ">
        <div className="container mx-auto">
          <div className="flex flex-row items-center py-3 justify-end px-4 lg:px-0">
            <a
              className="hover:text-white text-xl text-gray-200"
              href="https://github.com/rexlManu/dailyanime"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </a>
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-4 grid-cols-3 lg:flex flex-row flex-1 lg:overflow-hidden max-w-[1870px] mx-auto">
        {days.map((day) => {
          const props = { day, medias };
          return <CalenderDay {...props} />;
        })}
      </div>
    </div>
  );
}

function MediaCard({ id, nextAiringEpisode, title, coverImage }) {
  return (
    <div className="flex flex-col px-4 py-2">
      <p className="text-gray-300 text-sm">
        {moment(nextAiringEpisode.airingAt * 1000).format("h:mm a")}
      </p>
      <h3 className="uppercase text-blue-500 text-xl leading-5 py-1 hover:text-blue-400">
        <a
          href={"https://anilist.co/anime/" + id}
          target="_blank"
          rel="noreferrer"
        >
          {title.userPreferred}
        </a>
      </h3>
      <p className="text-blue-500 text-lg pb-2">
        Episode {nextAiringEpisode.episode}
      </p>
      <img className="rounded" src={coverImage.large} alt="" />
    </div>
  );
}

function SkeletonMediaCard() {
  return (
    <div className="flex flex-col px-4 py-2 animate-pulse">
      <p className="text-gray-300 text-sm w-16 h-4 bg-gray-700 rounded"></p>
      <h3 className="uppercase text-blue-500 text-xl leading-5 my-2 hover:text-blue-400 cursor-default w-32 h-7 bg-gray-700 rounded">
        <a target="_blank" rel="noreferrer"></a>
      </h3>
      <p className="text-blue-500 text-lg mb-2 w-24 h-6 bg-gray-700 rounded"></p>
      <div className="w-full h-56 w-[200px] bg-gray-700 rounded"></div>
    </div>
  );
}

function CalenderDay({ day, medias }) {
  let cards = medias
    .filter(
      (media) =>
        media.nextAiringEpisode &&
        media.nextAiringEpisode.airingAt * 1000 > day.startTime &&
        media.nextAiringEpisode.airingAt * 1000 < day.endTime
    )
    .sort((a, b) => a.nextAiringEpisode.airingAt - b.nextAiringEpisode.airingAt)
    .map((media) => <MediaCard {...media} />);
  if (cards.length === 0) {
    // fill with skeleton
    cards = [];
    range(0, 10).forEach(() => cards.push(<SkeletonMediaCard />));
  }
  return (
    <div className="flex flex-col space-y-4 lg:flex-1 flex-shrink-0 overflow-hidden">
      <div className="text-center py-6 flex-shrink">
        <p className="text-gray-300 text-sm">{day.time.format("M/D")}</p>
        <h2 className="text-3xl font-medium text-blue-500">{day.name}</h2>
      </div>
      <div className="h-96 lg:h-auto flex flex-col space-y-2 divide-y divide-gray-800 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-700">
        {cards}
      </div>
    </div>
  );
}

export default App;
